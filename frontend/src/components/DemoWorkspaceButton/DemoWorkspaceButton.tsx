import Button from '@components/Button/Button/Button';
import SvgLogInIcon from '@icons/LogInIcon';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import styles from './DemoWorkspaceButton.module.scss';

interface Props {
    integrated: boolean;
}

/**
 * The application ID we use internally e.g. for our backend, database, etc.
 */
export const DEMO_WORKSPACE_APPLICATION_ID = '0';
/**
 * The application ID we show in the URL. This should be used instead of `DEMO_WORKSPACE_APPLICATION_ID` when user-facing.
 * */
export const DEMO_WORKSPACE_PROXY_APPLICATION_ID = 'demo';

const DemoWorkspaceButton = ({ integrated }: Props) => {
    const history = useHistory();
    const { pathname } = useLocation();
    const { currentApplication } = useApplicationContext();

    const [, path] = pathname.split('/').filter((token) => token.length);

    if (
        integrated &&
        currentApplication?.id !== DEMO_WORKSPACE_APPLICATION_ID
    ) {
        return null;
    }

    return (
        <Button
            className={styles.demoWorkspaceButton}
            type="primary"
            trackingId="DemoWorkspace"
            onClick={() => {
                history.push(`/${DEMO_WORKSPACE_PROXY_APPLICATION_ID}/${path}`);
            }}
        >
            <SvgLogInIcon /> Visit Demo Workspace
        </Button>
    );
};

export default DemoWorkspaceButton;