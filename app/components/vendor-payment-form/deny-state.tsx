import { Text } from "@mantine/core";

export const DenyState = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Access Denied
      </h2>
      <p className="text-gray-700">
        This form is only accessible to coaches and facilitators. If you
        believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
};
