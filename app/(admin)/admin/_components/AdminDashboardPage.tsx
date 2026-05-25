import {Container, List, ListItem, Stack, Text, Title} from '@mantine/core';

export function AdminDashboardPage() {
  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="flex-start"
      gap="md">
      <Container size="md">
        <Title order={1} ta="center">
          Přehled
        </Title>

        <Text size="lg" mt="md">
          Nápady na content pro admin dashboard:
        </Text>

        <List mt="sm" spacing="xs" withPadding>
          <ListItem>
            seznam číselných dat, kolik je čeho na webu aktivních (produkty,
            koncerty, beacony, link redirector, ...)
          </ListItem>
          <ListItem>upozorneni na nevyrizene objednaky</ListItem>
          <ListItem>upozorneni na nekompletní koncerty</ListItem>
          <ListItem>aktivní beacony</ListItem>
          <ListItem>návštěvnost webu v grafech a statistikach</ListItem>
          <ListItem>statistiky využití link redirectoru, beaconů</ListItem>
        </List>

        <Text c="dimmed" mt="md">
          ... co dál?
        </Text>
      </Container>
    </Stack>
  );
}
