"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export const getProfile = async (token: string | null = null) => {
  let access_token = token;

  if (!access_token) {
    const { data: session, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session || !session.session) {
      throw new Error("User not authenticated");
    }
    access_token = session.session.access_token;
  }

  const response = await fetch("/api/user/profile", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  const profileData = await response.json();
  return profileData.data;
};
