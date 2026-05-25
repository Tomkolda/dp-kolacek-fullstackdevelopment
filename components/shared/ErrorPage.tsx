import {Button, Container, Group, Text, Title} from '@mantine/core';

import classes from './ErrorPage.module.css';

type Args = {
  code?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
};

const defaultMessageMap: Record<string, {title: string; description: string}> =
  {
    404: {
      title: 'Page you are trying to open does not exist.',
      description:
        'You may have mistyped the address, or the page has been moved to another URL. If you think this is an error contact support.',
    },
    500: {
      title: 'Sorry, something went wrong.',
      description: 'An unspecified error occurred. Please try again later.',
    },
  };

export function ErrorPage({
  code,
  title,
  description,
  buttonText,
  buttonLink,
}: Args) {
  const defaultMessage =
    defaultMessageMap[code ?? '500'] || defaultMessageMap['500']; // if code is unknown, use 500 for default description

  return (
    <Container className={classes.root}>
      <div className={classes.inner}>
        <div className={classes.label}>{code}</div>
        <div className={classes.content}>
          <Title className={classes.title}>
            {title ?? defaultMessage.title}
          </Title>
          <Text
            c="dimmed"
            size="lg"
            ta="center"
            className={classes.description}>
            {description ?? defaultMessage.description}
          </Text>
          <Group justify="center">
            <Button size="md" component="a" href={buttonLink ?? '/'}>
              {buttonText ?? 'Vrátit se zpět'}
            </Button>
          </Group>
        </div>
      </div>
    </Container>
  );
}
