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
};

for (const [relative, changes] of Object.entries(replacements)) {
  const file = path.join(root, relative);
  let source = fs.readFileSync(file, 'utf8');
  for (const [before, after] of changes) {
    if (source.includes(after)) continue;
    if (!source.includes(before)) throw new Error(`Patch no longer applies: ${relative}`);
    source = source.replace(before, after);
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
