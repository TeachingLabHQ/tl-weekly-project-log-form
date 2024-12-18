// root.tsx
import React, { useContext, useEffect } from "react";
import { withEmotionCache } from "@emotion/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { MetaFunction, LinksFunction } from "@remix-run/node"; // Depends on the runtime you choose

import { ServerStyleContext, ClientStyleContext } from "./context";
import { Navbar } from "./components/navigation/navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";

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

interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(
  ({ children }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData?.reset();
    }, []);

    return (
      <html lang="en">
        <head>
          <Meta />
          <Links />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(" ")}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
          {/* <script
            src="https://apis.google.com/js/platform.js"
            async
            defer
          ></script> */}
          {/* <meta
            name="google-signin-client_id"
            content="908203966684-tl3or1jsfs1vc2juqkn7m3jnf6nah4gr.apps.googleusercontent.com"
          /> */}
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }
);
export default function App() {
  return (
    <Document>
      <GoogleOAuthProvider clientId="908203966684-tl3or1jsfs1vc2juqkn7m3jnf6nah4gr.apps.googleusercontent.com">
        <ChakraProvider value={defaultSystem}>
          <Navbar />
          <Outlet />
        </ChakraProvider>
      </GoogleOAuthProvider>
    </Document>
  );
}
