import { Layout } from "antd";
import Sidebar from "../component/Sidebar";
import TopHeader from "../component/TopHeader";

function CommonPageStructure({ children }) {
    return (
        <>
            <Layout>
                <Sidebar />

                <Layout>
                    <TopHeader />

                    {children}
                </Layout>
            </Layout>
        </>
    );
}

export default CommonPageStructure;