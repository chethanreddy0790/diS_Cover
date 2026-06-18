import {
  ALLOWED_COLLEGE_DOMAINS,
  COLLEGE_EMAIL_REGEX,
  MAX_BIO_LENGTH,
  MAX_HEADLINE_LENGTH,
  MAX_POST_DESCRIPTION_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "./constants";

export const isCollegeEmail = (email: string) => {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split('@')[1] ?? '';
  return COLLEGE_EMAIL_REGEX.test(normalized) || ALLOWED_COLLEGE_DOMAINS.includes(domain);
};

export const getEmailDomain = (email: string) =>
  email.trim().toLowerCase().split("@")[1] ?? "";

export const inferCollegeNameFromDomain = (domain: string) => {
  const root = domain.replace(/\.(edu|ac\.[a-z]{2})$/i, "");
  return root
    .split(/[.-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const isStrongEnoughPassword = (password: string) =>
  password.trim().length >= MIN_PASSWORD_LENGTH;

export const validatePostDescription = (description: string) =>
  description.trim().length > 0 &&
  description.trim().length <= MAX_POST_DESCRIPTION_LENGTH;

export const validateProfileBio = (bio: string) =>
  bio.trim().length <= MAX_BIO_LENGTH;

export const validateHeadline = (headline: string) =>
  headline.trim().length > 0 && headline.trim().length <= MAX_HEADLINE_LENGTH;

export const splitTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5);
