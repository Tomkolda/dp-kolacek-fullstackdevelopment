'use client';

import {Alert as MantineAlert} from '@mantine/core';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import {useId} from 'react';

type AlertProps = {
  title?: string;
  description?: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  styles?: object;
};

const severityAlertMap = {
  error: {color: 'red', variant: 'light', icon: <IconAlertCircle />},
  warning: {color: 'yellow', variant: 'light', icon: <IconAlertCircle />},
  info: {color: 'blue', variant: 'light', icon: <IconInfoCircle />},
  success: {color: 'green', variant: 'light', icon: <IconCircleCheck />},
};

export function Alert({title, description, severity, styles}: AlertProps) {
  const {color, variant, icon} = severityAlertMap[severity];

  // Stabilní `id` pro SSR/CSR hydrataci (Mantine jinak generuje svoje `id`,
  // která se občas mezi serverem a klientem rozjedou a způsobí hydration warning).
  const reactId = useId().replace(/[:«»]/g, '');
  const id = `ff-alert-${reactId}`;

  return (
    <MantineAlert
      id={id}
      variant={variant}
      color={color}
      icon={icon}
      title={title}
      {...(styles ?? {})}>
      {description ?? null}
    </MantineAlert>
  );
}
