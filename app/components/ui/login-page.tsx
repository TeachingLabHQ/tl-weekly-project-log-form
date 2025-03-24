import { Card, Container, Flex, Text, Title } from "@mantine/core";
import TLLogo from "../../assets/tllogo.png";
import BackgroundImg from "../../assets/background.png";
export const LoginPage = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <Container size="sm" className="h-screen flex items-center justify-center">
      <Card
        shadow="sm"
        p="xl"
        radius="md"
        withBorder
        className="w-full bg-white/80 backdrop-blur-sm"
      >
        <Flex direction="column" align="center" gap="lg">
          <img src={TLLogo} alt="Teaching Lab Logo" style={{ height: 80 }} />

          <Title order={2} ta="center" mb="md">
            Welcome to Teaching Lab Form Hub
          </Title>

          <Text size="lg" ta="center" mb="md">
            Access all your forms and dashboards in one place
          </Text>

          <Card
            p="lg"
            radius="md"
            className="w-full bg-blue-600/10 border border-blue-600/30"
          >
            <Flex direction="column" align="center" gap="md">
              <Text
                size="lg"
                fw={500}
                ta="center"
                className={errorMessage ? "text-red-600" : "text-blue-800"}
              >
                {errorMessage
                  ? errorMessage
                  : "Please log in with your Teaching Lab email"}
              </Text>

              <Text size="sm" c="dimmed" ta="center">
                Use the Google login button in the top right corner to sign in
                with your Teaching Lab account.
              </Text>
            </Flex>
          </Card>

          <Text size="sm" c="dimmed" ta="center" mt="md">
            If you're having trouble logging in, please contact the IT
            department for assistance.
          </Text>
        </Flex>
      </Card>
    </Container>
  );
};
