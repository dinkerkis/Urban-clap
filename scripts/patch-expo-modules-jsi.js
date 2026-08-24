const fs = require('node:fs');
const path = require('node:path');

const root = path.dirname(require.resolve('expo-modules-jsi/package.json'));
const replacements = {
  'apple/Sources/ExpoModulesJSI/Contexts/HostFunctionContext.swift': [
    ['internal final class HostFunctionContext: Sendable {', 'internal final class HostFunctionContext: @unchecked Sendable {'],
    ['internal final class UnownedThisHostFunctionContext: Sendable {', 'internal final class UnownedThisHostFunctionContext: @unchecked Sendable {'],
  ],
  'apple/Sources/ExpoModulesJSI/Contexts/HostObjectContext.swift': [
    ['internal final class HostObjectContext: Sendable {', 'internal final class HostObjectContext: @unchecked Sendable {'],
  ],
  'apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptBigInt.swift': [
    ['internal weak let runtime: JavaScriptRuntime?', 'internal weak var runtime: JavaScriptRuntime?'],
  ],
  'apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptError.swift': [
    ['public final class JavaScriptError: Error, Sendable {', 'public final class JavaScriptError: Error, @unchecked Sendable {'],
    ['private weak let runtime: JavaScriptRuntime?', 'private weak var runtime: JavaScriptRuntime?'],
  ],
  'apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptFunction.swift': [
    ['internal weak let runtime: JavaScriptRuntime?', 'internal weak var runtime: JavaScriptRuntime?'],
  ],
  'apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptValue.swift': [
    ['public final class JavaScriptValue: JavaScriptType, Equatable, Escapable {', 'public final class JavaScriptValue: JavaScriptType, Equatable, Escapable, @unchecked Sendable {'],
  ],
  'apple/Sources/ExpoModulesJSI/Runtime/JavaScriptPropNameID.swift': [
    ['public final class JavaScriptPropNameID: JavaScriptType {', 'public final class JavaScriptPropNameID: JavaScriptType, @unchecked Sendable {'],
  ],
  'apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h': [
    [
      'SWIFT_RETURNS_RETAINED RuntimeScheduler(void *scheduler, ScheduleFn fn) noexcept',
      'RuntimeScheduler(void *scheduler, ScheduleFn fn) noexcept',
    ],
    ['SWIFT_RETURNS_RETAINED RuntimeScheduler() {}', 'RuntimeScheduler() {}'],
  ],
};

for (const [relative, changes] of Object.entries(replacements)) {
  const file = path.join(root, relative);
  let source = fs.readFileSync(file, 'utf8');
  for (const [before, after] of changes) {
    if (source.includes(before)) {
      source = source.replace(before, after);
      continue;
    }
    if (!source.includes(after)) throw new Error(`Patch no longer applies: ${relative}`);
  }
  fs.writeFileSync(file, source);
}

// Swift 6.2.0 (Xcode 26.0) rejects `weak let`, while the newer compiler used by
// the supported Xcode version accepts the upstream ExpoModulesJSI sources.
// Cover every runtime holder so a clean npm install does not reintroduce any of
// the thirteen diagnostics shown by Xcode.
const sourcesRoot = path.join(root, 'apple/Sources/ExpoModulesJSI');
const pending = [sourcesRoot];
while (pending.length > 0) {
  const directory = pending.pop();
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      pending.push(file);
      continue;
    }
    if (!entry.name.endsWith('.swift')) continue;

    const source = fs.readFileSync(file, 'utf8');
    const patched = source.replaceAll(
      'weak let runtime: JavaScriptRuntime?',
      'weak var runtime: JavaScriptRuntime?'
    );
    if (patched !== source) fs.writeFileSync(file, patched);
  }
}

console.log('Applied temporary ExpoModulesJSI compatibility patch for Xcode 26.0.');

// ExpoModulesCore also captures EventEmitter with `weak let`. Xcode 26's Swift
// compiler requires every weak reference to be mutable, even when the reference
// is used only as a safe nonisolated bridge into the JavaScript actor.
const expoModulesCoreRoot = path.dirname(require.resolve('expo-modules-core/package.json'));
const eventEmitterFile = path.join(expoModulesCoreRoot, 'ios/Core/Events/EventEmitter.swift');
const eventEmitterSource = fs.readFileSync(eventEmitterFile, 'utf8');
let patchedEventEmitterSource = eventEmitterSource.replaceAll(
  'nonisolated(unsafe) weak let emitter = self',
  'nonisolated(unsafe) weak var emitter = self'
);
patchedEventEmitterSource = patchedEventEmitterSource.replaceAll(
  'nonisolated(unsafe) weak var emitter = self',
  'let emitterReference = WeakEventEmitterReference(self)'
);
patchedEventEmitterSource = patchedEventEmitterSource.replaceAll(
  'guard let emitter else {',
  'guard let emitter = emitterReference.value else {'
);
patchedEventEmitterSource = patchedEventEmitterSource.replaceAll(
  'guard let emitter, let appContext else {',
  'guard let emitter = emitterReference.value, let appContext else {'
);
if (!patchedEventEmitterSource.includes('private final class WeakEventEmitterReference')) {
  patchedEventEmitterSource = patchedEventEmitterSource.replace(
    'public extension EventEmitter {',
    `private final class WeakEventEmitterReference: @unchecked Sendable {
  weak var value: (any EventEmitter)?

  init(_ value: any EventEmitter) {
    self.value = value
  }
}

public extension EventEmitter {`
  );
}
if (patchedEventEmitterSource !== eventEmitterSource) {
  fs.writeFileSync(eventEmitterFile, patchedEventEmitterSource);
}

const sharedObjectRegistryFile = path.join(
  expoModulesCoreRoot,
  'ios/Core/SharedObjects/SharedObjectRegistry.swift'
);
const sharedObjectRegistrySource = fs.readFileSync(sharedObjectRegistryFile, 'utf8');
let patchedSharedObjectRegistrySource = sharedObjectRegistrySource.replace(
  'private weak let appContext: AppContext?',
  'private weak var appContext: AppContext?'
);
patchedSharedObjectRegistrySource = patchedSharedObjectRegistrySource.replace(
  'public final class SharedObjectRegistry: Sendable {',
  'public final class SharedObjectRegistry: @unchecked Sendable {'
);
if (patchedSharedObjectRegistrySource !== sharedObjectRegistrySource) {
  fs.writeFileSync(sharedObjectRegistryFile, patchedSharedObjectRegistrySource);
}

console.log('Applied temporary ExpoModulesCore compatibility patch for Xcode 26.0.');

// expo@57.0.4 still passes a raw facebook::react::RuntimeScheduler* into
// AppContext.setRuntime, but expo-modules-core@57.0.6+ treats that pointer as a
// SchedulerHandle created by createReactSchedulerHandle. The mismatch crashes
// in RuntimeScheduler.cpp on first JS dispatch (app install / reload).
const expoRoot = path.dirname(require.resolve('expo/package.json'));
const factoryFile = path.join(expoRoot, 'ios/AppDelegates/ExpoReactNativeFactory.mm');
const factorySource = fs.readFileSync(factoryFile, 'utf8');
const factoryBefore = `  auto binding = facebook::react::RuntimeSchedulerBinding::getBinding(runtime);
  auto scheduler = binding ? binding->getRuntimeScheduler() : nullptr;

  [_appContext setRuntime:&runtime
                scheduler:scheduler.get()
                 dispatch:scheduler ? reinterpret_cast<const void *>(&expo::dispatchOnReactScheduler) : nullptr];`;
const factoryAfter = `  auto binding = facebook::react::RuntimeSchedulerBinding::getBinding(runtime);
  auto scheduler = binding ? binding->getRuntimeScheduler() : nullptr;
  void *schedulerHandle = expo::createReactSchedulerHandle(scheduler);

  [_appContext setRuntime:&runtime
                scheduler:schedulerHandle
                 dispatch:schedulerHandle ? reinterpret_cast<const void *>(&expo::dispatchOnReactScheduler) : nullptr];`;
if (factorySource.includes(factoryBefore)) {
  fs.writeFileSync(factoryFile, factorySource.replace(factoryBefore, factoryAfter));
} else if (!factorySource.includes('createReactSchedulerHandle(scheduler)')) {
  throw new Error('Patch no longer applies: ExpoReactNativeFactory.mm');
}

console.log('Applied RuntimeScheduler handle patch for ExpoReactNativeFactory.');
