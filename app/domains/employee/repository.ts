import { Errorable } from "../../utils/errorable";
import { EmployeeProfile } from "./model";

export interface EmployeeRepository {
  fetchEmployee(email: string): Promise<Errorable<EmployeeProfile>>;
}

export function employeeRepository(): EmployeeRepository {
  return {
    fetchEmployee: async (email: string) => {
      try {
        let queryEmployee = `{boards(ids:2227132353) {items_page (limit: 1, query_params: {rules: [{column_id: "text25", compare_value: ["${email}"]}], operator: and}) { items { name column_values(ids:"dropdown7"){text}}}}}`;
        const response = await fetch("https://api.monday.com/v2", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjIzNDI2ODE2OCwidWlkIjozMTI4ODQ0NCwiaWFkIjoiMjAyMy0wMi0wM1QwMDozNjoyMC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODg4NDgxOSwicmduIjoidXNlMSJ9.oM37gRdrLf8UnnmuZIM-QWDRoT_GtgFLLyHpvnxGUtQ",
            "API-Version": "2023-10",
          },
          body: JSON.stringify({
            query: queryEmployee,
            // 'variables' : JSON.stringify(req.body.vars)
          }),
        });

        const result = await response.json();
        console.log(result);
        const isEmployeePresent =
          result.data.boards[0].items_page.items.length === 0 ? false : true;
        console.log(isEmployeePresent);
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
