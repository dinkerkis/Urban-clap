import { Image } from 'expo-image';

type EditIconProps = {
  size?: number;
};

export function EditIcon({ size = 16 }: EditIconProps) {
  return (
    <Image
      contentFit="contain"
      source={require('../../assets/edit.png')}
      style={{ width: size, height: size }}
    />
  );
}
