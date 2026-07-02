import { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";
import dayjs from "dayjs";
import supabase from "../../client/supabase";

export default function SystemActivity() {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    loadActivity();
  }, []);

  async function loadActivity() {
    setLoading(true);

    try {
      // Login Activity
      const { data: activities, error: activityError } = await supabase
        .from("login_activity")
        .select("*")
        .order("login_time", { ascending: false });

      if (activityError) throw activityError;

      if (!activities?.length) {
        setTableData([]);
        return;
      }

      // Staff Details
      const staffIds = [...new Set(activities.map((item) => item.staff_id))];

      const { data: staffs, error: staffError } = await supabase
        .from("staff")
        .select(`
          id,
          first_name,
          role:role_id (
            role_name
          )
        `)
        .in("id", staffIds);

      if (staffError) throw staffError;

      // Merge Data
      const rows = activities.map((activity) => {
        const staff = staffs.find((s) => s.id === activity.staff_id);

        return {
          key: activity.id,
          staff: staff?.first_name || "-",
          role: staff?.role?.role_name || "-",
          loginTime: activity.login_time,
        };
      });

      setTableData(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      title: "Staff",
      dataIndex: "staff",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Login Time",
      dataIndex: "loginTime",
      render: (value) =>
        value
          ? dayjs(value).format("DD/MM/YYYY hh:mm A")
          : "-",
    },
  ];

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto pr-2">
      <Card>
        <Table
          loading={loading}
          columns={columns}
          dataSource={tableData}
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>
    </div>
  );
}