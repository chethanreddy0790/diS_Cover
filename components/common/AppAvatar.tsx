import React from "react";
import { Avatar } from "react-native-paper";

import { initialsFromName } from "../../utils/format";

interface AppAvatarProps {
  name: string;
  size?: number;
  uri?: string;
}

export const AppAvatar = ({ name, size = 44, uri }: AppAvatarProps) =>
  uri ? (
    <Avatar.Image size={size} source={{ uri }} />
  ) : (
    <Avatar.Text label={initialsFromName(name) || "CC"} size={size} />
  );
