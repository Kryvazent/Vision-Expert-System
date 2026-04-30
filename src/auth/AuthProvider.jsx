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
  const [role, setRole] = useState(null);

  async function loadStaffProfile(authUserId) {

    // console.log("Loading staff profile for authUserId:", authUserId);

    if (!authUserId) { setStaff(null); return; }

    const GET_STAFF_PROFILE = gql`
      query GetStaffProfile($authUserId: UUID!) {
        staffCollection(filter: { auth_user_id: { eq: $authUserId } }) {
          edges {
            node {
              id
              first_name
              last_name
              branch{
                id
                branch_name
              }
              role {
                  id
                  role_name
              }
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

      // console.log("Fetched staff profile:", staffData);

      const fetchedRole = staffData?.role?.role_name || null;
      setRole(fetchedRole);

    } catch (error) {
      console.error("Failed to fetch staff profile:", error.message);
      setStaff(null);
    }

  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user?.id) {
        loadStaffProfile(session.user.id); // ✅ only when ready
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.id) {
          loadStaffProfile(session.user.id); // ✅ safe
        } else {
          setStaff(null);
          await apolloSupabaseGraphqlClient.clearStore();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => await supabase.auth.signOut();

  // console.log("ROLE:", MENU_BY_ROLE[role]?.[0]?.key);
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