// root.tsx
import React, { useContext, useEffect, useState } from "react";
import { withEmotionCache } from "@emotion/react";
import "@mantine/core/styles.css";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { MetaFunction, LinksFunction } from "@remix-run/node"; // Depends on the runtime you choose
import "@mantine/dates/styles.css";
import { ServerStyleContext, ClientStyleContext } from "./context";
import { Navbar } from "./components/navigation/navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "./tailwind.css";
import { Session, SessionContext } from "./components/context/sessionContext";
export const meta: MetaFunction = () => {
  return [
    { charSet: "utf-8" },
    { title: "Weekly Project Log" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
};

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap",
    },
  ];
};
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider withGlobalClasses={false}>{children}</MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  const [session, setSessionState] = useState<Session | null>(null);
  useEffect(() => {
    const storedSession = sessionStorage.getItem("storedSession");
    if (storedSession) {
      setSessionState(JSON.parse(storedSession));
    }
  }, []);
  const setSession = (newSession: Session | null) => {
    if (newSession) {
      sessionStorage.setItem("storedSession", JSON.stringify(newSession));
    } else {
      sessionStorage.removeItem("storedSession");
      //to ensure error message is clear
      setSessionState({
        name: "",
        email: "",
        buesinessFunction: "",
      });
    }
    setSessionState(newSession);
  };
  return (
    <GoogleOAuthProvider clientId="908203966684-tl3or1jsfs1vc2juqkn7m3jnf6nah4gr.apps.googleusercontent.com">
      <SessionContext.Provider value={{ session, setSession }}>
        <Navbar />
        <Outlet />
      </SessionContext.Provider>
    </GoogleOAuthProvider>
  );
}
