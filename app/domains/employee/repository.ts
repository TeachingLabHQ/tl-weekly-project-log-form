import { Errorable } from "../../utils/errorable";
import { fetchMondayData } from "../utils";
import { EmployeeProfile } from "./model";

export interface EmployeeRepository {
  fetchEmployee(email: string): Promise<Errorable<EmployeeProfile>>;
}

export function employeeRepository(): EmployeeRepository {
  return {
    fetchEmployee: async (email: string) => {
      try {
        let queryEmployee = `{boards(ids:2227132353) {items_page (limit: 1, query_params: {rules: [{column_id: "text25", compare_value: ["${email}"]}], operator: and}) { items { name column_values(ids:"dropdown7"){text}}}}}`;
        const response = await fetchMondayData(queryEmployee);

        const result = await response.json();

        const isEmployeePresent =
          result.data.boards[0].items_page.items.length === 0 ? false : true;

        if (!isEmployeePresent)
          return { data: null, error: "Employee does not exist" };
        const businessFunction =
          result.data.boards[0].items_page.items[0]["column_values"][0]["text"];
        const name = result.data.boards[0].items_page.items[0]["name"];
        const employeeInfo = { name, email, businessFunction };
        return { data: employeeInfo, error: null };
      } catch (error) {
        console.error("Error fetching data:", error);
        return { data: null, error: error };
      }
    },
  };
}
