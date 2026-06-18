import { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ProfileSetup: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
  Search: undefined;
};

export type MainTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList> | undefined;
  Create: undefined;
  Profile: undefined;
};
