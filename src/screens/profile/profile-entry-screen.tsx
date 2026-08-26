import { colors } from '../../theme';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { LoadingDots } from '../../components/loading-dots';
import { ProfileScreen } from './profile-screen';

const PROFILE_LOADER_MS = 800;

type ProfileEntryScreenProps = {
  email?: string;
  name?: string;
  phone?: string;
  profilePicture?: string;
  onAbout?: () => void;
  onBack: () => void;
  onCompleteProfile: () => void;
  onHelpSupport?: () => void;
  onLogout: () => void;
  onManageAddresses?: () => void;
  onManagePaymentMethods?: () => void;
  onMyBookings?: () => void;
  onMyPlans?: () => void;
  onMyRating?: () => void;
  onNativeDevices?: () => void;
  onPassesMembership?: () => void;
  onSettings?: () => void;
  onWallet?: () => void;
};

export function ProfileEntryScreen(props: ProfileEntryScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), PROFILE_LOADER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Animated.View
        entering={FadeIn.duration(160)}
        exiting={FadeOut.duration(140)}
        accessibilityLabel="Loading profile"
        accessibilityRole="progressbar"
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}
      >
        <LoadingDots />
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(220)} style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfileScreen {...props} />
    </Animated.View>
  );
}
