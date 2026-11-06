import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Layout from "@/components/Layout";
import RequireAuth from "@/components/RequireAuth";

import Page1 from "./pages/Page1";
import Login from "./pages/Login";
import Inscription from "./pages/Inscription";
import Matiere from "./pages/Matiere";
import Continent from "./pages/Continent";
import Pays from "./pages/Pays";
import Paroisse from "./pages/Paroisse";
import Inscrits from "./pages/Inscrits";
import ListeInscrits from "./pages/ListeInscrits";
import NotFound from "./pages/NotFound";

const protectedPages = [
  { path: "/matiere", Component: Matiere },
];

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page1 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />

        {protectedPages.map(({ path, Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <RequireAuth>
                <Layout>
                  <Component />
                </Layout>
              </RequireAuth>
            }
          />
        ))}


        <Route
          path="/liste-inscrits"
          element={
            <RequireAuth>
              <Layout>
                <ListeInscrits />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/continents/:continent"
          element={
            <RequireAuth>
              <Layout><Continent /></Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/pays/:country"
          element={
            <RequireAuth>
              <Layout><Pays /></Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/paroisses/:country/:diocese"
          element={
            <RequireAuth>
              <Layout><Paroisse /></Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/inscrits/:country/:diocese/:paroisse"
          element={
            <RequireAuth>
              <Layout><Inscrits /></Layout>
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
