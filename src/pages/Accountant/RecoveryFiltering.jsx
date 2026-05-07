import { Card, DatePicker, Select, Table } from "antd";
import { useState } from "react";

import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

const GET_RECOVERY_DATA = gql`
  query GetRecoveryData($date: Date!) {
    orderCollection(filter: { estimated_delivery: { gte: $date } }) {
      edges {
        node {
          id

          clinic_attend_customer {
            customer_has_branch {

              branch {
                branch_name
              }

              customer {
                first_name
                last_name
                contact_no
              }

            }
          }
        }
      }
    }
  }
`;

function RecoveryFiltering() {

  // store selected date
  const [selectedDate, setSelectedDate] = useState(null);

  // store selected branch
  const [selectedBranch, setSelectedBranch] =
    useState("All Branches");

  // GraphQL query
  const [fetchRecoveryData, { data, loading, error }] =
    useLazyQuery(GET_RECOVERY_DATA);

  // convert GraphQL data to table format
 const tableData =
  data?.orderCollection?.edges?.map((item, index) => {

    const customerData =
      item?.node?.clinic_attend_customer?.customer_has_branch;

    return {

      key: index,

      id: item?.node?.id,

      name: `${customerData?.customer?.first_name || ""} ${customerData?.customer?.last_name || ""
        }`,

      mobile: customerData?.customer?.contact_no,

      branch: customerData?.branch?.branch_name,
    };
  })
    ?.filter((item) => {

      if (selectedBranch === "All Branches") {
        return true;
      }

      return item.branch === selectedBranch;
    }) || [];


  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

      <Card className="rounded-xl">

        <div className="flex flex-wrap gap-6 mb-4">

          {/* DATE FILTER */}
          <div className="flex-1 min-w-[250px]">

            <p className="mb-2 font-medium">
              Filter by Date
            </p>

            <DatePicker
              className="w-full"

              onChange={(date, dateString) => {

                // save selected date
                setSelectedDate(dateString);

                // run query
                if (dateString) {
                  fetchRecoveryData({
                    variables: {
                      date: dateString,
                    },
                  });
                }
              }}
            />
          </div>

          {/* BRANCH FILTER */}
          <div className="flex-1 min-w-[250px]">

            <p className="mb-2 font-medium">
              Filter by Branch
            </p>

            <Select
              className="w-full"

              defaultValue="All Branches"

              options={[
                {
                  value: "All Branches",
                  label: "All Branches",
                },

                {
                  value: "Nuwaraeliya",
                  label: "Nuwaraeliya",
                },

                {
                  value: "Mahiyanganaya",
                  label: "Mahiyanganaya",
                },

                {
                  value: "Kandy",
                  label: "Kandy",
                },

                {
                  value: "Main Branch",
                  label: "Main Branch",
                },
              ]}

              onChange={(value) => {

                // save selected branch
                setSelectedBranch(value);
              }}
            />
          </div>
        </div>

        {/* TABLE */}
        <Table
          loading={loading}

          columns={[
            {
              title: "Order ID",
              dataIndex: "id",
            },

            {
              title: "Customer Name",
              dataIndex: "name",
            },

            {
              title: "Mobile",
              dataIndex: "mobile",
            },

            {
              title: "Branch",
              dataIndex: "branch",
            },
          ]}

          dataSource={tableData}

          pagination={false}
        />

      </Card>
    </div>
  );
}

export default RecoveryFiltering;