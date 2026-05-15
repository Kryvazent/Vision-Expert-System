import { Card, DatePicker, Select, Table, Input } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

const GET_RECOVERY_DATA = gql`
  query GetRecoveryData($date: Date!) {
    orderCollection(
      filter: {
        estimated_delivery: { gte: $date }
      }
    ) {
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

  // today's date
  const today =
    new Date().toISOString().split("T")[0];

  // store selected date
  const [selectedDate, setSelectedDate] =
    useState(today);

  // store selected branch
  const [selectedBranch, setSelectedBranch] =
    useState("All Branches");

  // customer search
  const [customerSearch, setCustomerSearch] =
    useState("");

  // branch search
  const [branchSearch, setBranchSearch] =
    useState("");

  // GraphQL query
  const [
    fetchRecoveryData,
    { data, loading, error }
  ] = useLazyQuery(GET_RECOVERY_DATA);

  // LOAD TODAY DATA AUTOMATICALLY
  useEffect(() => {

    fetchRecoveryData({
      variables: {
        date: today,
      },
    });

  }, []);

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

        mobile:
          customerData?.customer?.contact_no,

        branch:
          customerData?.branch?.branch_name,
      };
    })

      ?.filter((item) => {

        // branch dropdown filter
        const branchFilter =
          selectedBranch === "All Branches"
            ? true
            : item.branch === selectedBranch;

        // customer search filter
        const customerFilter =
          item.name
            ?.toLowerCase()
            .includes(
              customerSearch.toLowerCase()
            );

        // branch search filter
        const branchSearchFilter =
          item.branch
            ?.toLowerCase()
            .includes(
              branchSearch.toLowerCase()
            );

        return (
          branchFilter &&
          customerFilter &&
          branchSearchFilter
        );
      }) || [];

  return (

    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

      <Card className="rounded-xl">

        {/* SEARCH INPUTS */}

        <div className="flex flex-wrap gap-4 mb-6">

          {/* CUSTOMER SEARCH */}

          <div>

            <p className="mb-2 font-medium">
              Search Customer
            </p>

            <Input
              placeholder="Search Customer Name"

              value={customerSearch}

              onChange={(e) =>
                setCustomerSearch(
                  e.target.value
                )
              }

              className="w-52"
            />
          </div>

          {/* BRANCH SEARCH */}

          <div>

            <p className="mb-2 font-medium">
              Search Branch
            </p>

            <Input
              placeholder="Search Branch Name"

              value={branchSearch}

              onChange={(e) =>
                setBranchSearch(
                  e.target.value
                )
              }

              className="w-52"
            />
          </div>

        </div>

        <div className="flex flex-wrap gap-6 mb-4">

          {/* DATE FILTER */}

          <div className="flex-1 min-w-[250px]">

            <p className="mb-2 font-medium">
              Filter by Date
            </p>

            <DatePicker
              className="w-full"

              value={
                selectedDate
                  ? dayjs(selectedDate)
                  : null
              }

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

        {error && (

          <p className="text-red-500 mt-4">

            Failed to load recovery data

          </p>

        )}

      </Card>
    </div>
  );
}

export default RecoveryFiltering;