import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import supabase from "../client/supabase";
import { MENU_BY_ROLE } from "../const/menu";
import { gql } from "@apollo/client";
import apolloSupabaseGraphqlClient from "../client/supabase-grphql-apollo.client";


export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);

  // Role comes straight from the JWT — no extra DB round-trip needed
  const role = session?.user?.role ?? null;


  async function loadStaffProfile(authUserId) {
    if (!authUserId) { setStaff(null); return; }

    const GET_STAFF_PROFILE = gql`
      query GetStaffProfile($authUserId: UUID!) {
  # Try using the prefixed name: SchemaNameTableCollection
  staffCollection(filter: {auth_user_id: {eq: $authUserId}}) {
    edges {
      node {
        id
        first_name
        last_name
        branch_id
      }
    }
  }
}


    `;

    try {

      const { data } = await apolloSupabaseGraphqlClient.query({
        query: GET_STAFF_PROFILE,
        variables: { authUserId },
        fetchPolicy: "network-only",
      });

      const staffData = data?.staffCollection?.edges?.[0]?.node || null;

      setStaff(staffData);
    } catch (error) {
      console.error("Failed to fetch staff profile:", error.message);
      setStaff(null);
    }

  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      loadStaffProfile(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        loadStaffProfile(session?.user?.id);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => await supabase.auth.signOut();

  console.log("ROLE:", MENU_BY_ROLE[role]?.[0]?.key);
  // console.log("ROLE:", MENU_BY_ROLE[role][0]);
  // console.log("ROLE:", MENU_BY_ROLE[role][0].key);


  const value = {
    session,
    user,
    staff,
    role,
    isLoading: session === undefined,
    isAuthenticated: !!session,
    homeRoute: MENU_BY_ROLE[role]?.[0]?.key ?? "/",
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}