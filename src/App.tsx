import { useCurrentAccount, ConnectButton } from "@onelabs/dapp-kit";
import { Box, Container, Flex, Heading, Tabs } from "@radix-ui/themes";
import { useState } from "react";
import { GameView } from "./components/GameView";
import { Leaderboard } from "./components/Leaderboard";

function App() {
  const currentAccount = useCurrentAccount();
  const [activeTab, setActiveTab] = useState('game');

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
          backgroundColor: "var(--gray-1)",
        }}
      >
        <Box>
          <Heading style={{ color: 'white' }}>1-Challenge Checkers</Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      
      <Container>
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="game" style={{ color: 'white' }}>Play Game</Tabs.Trigger>
            <Tabs.Trigger value="leaderboard" style={{ color: 'white' }}>Leaderboard</Tabs.Trigger>
            <Tabs.Trigger value="challenges" style={{ color: 'white' }}>My Challenges</Tabs.Trigger>
          </Tabs.List>

          <Box pt="3">
            <Tabs.Content value="game">
              <GameView />
            </Tabs.Content>

            <Tabs.Content value="leaderboard">
              <Leaderboard />
            </Tabs.Content>

            <Tabs.Content value="challenges">
              <Box style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
                <Text size="4">Active Challenges feature coming soon...</Text>
              </Box>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Container>
    </>
  );
}

export default App;