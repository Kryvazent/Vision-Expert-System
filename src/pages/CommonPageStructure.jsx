import { Layout } from "antd";
import Sidebar from "../component/Sidebar";
import TopHeader from "../component/TopHeader";

/**
 * CommonPageStructure — root shell for every authenticated page.
 *
 * The <main class="ve-content-wrap"> element owns the uniform padding so that
 * every page — whether it uses the shared <PageLayout> component or renders
 * its own <Content> — gets exactly the same gap from all four borders.
 *
 * Padding values come from CSS custom properties in main.css:
 *   --ve-page-padding-x  (horizontal, default 28 px)
 *   --ve-page-padding-y  (vertical,   default 28 px)
 */
function CommonPageStructure({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />

      <Layout style={{ overflow: "hidden", flex: 1 }}>
        <TopHeader />

        {/* ── Scrollable content area with uniform outer padding ── */}
        <main className="ve-content-wrap">
          {children}
        </main>
      </Layout>
    </Layout>
  );
}

export default CommonPageStructure;
