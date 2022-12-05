import { useAuthContext } from '@authentication/AuthContext'
import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import ProjectPicker from '@components/Header/components/ProjectPicker/ProjectPicker'
import Notifications from '@components/Header/Notifications/NotificationsV2'
import { linkStyle } from '@components/Header/styles.css'
import { useGetBillingDetailsForProjectQuery } from '@graph/hooks'
import { Maybe, PlanType, Project } from '@graph/schemas'
import {
	Box,
	IconAtSymbol,
	IconCog,
	IconDesktopComputer,
	IconDocumentText,
	IconDotsHorizontal,
	IconHome,
	IconOfficeBuilding,
	IconPlayCircle,
	IconQuestionMarkCircle,
	IconSpeakerphone,
	IconStackedBarChart,
	IconSwitchHorizontal,
	IconUserCircle,
	IconViewGridAdd,
	IconXCircle,
	LinkButton,
	Menu,
} from '@highlight-run/ui'
import { vars } from '@highlight-run/ui/src/css/vars'
import SvgXIcon from '@icons/XIcon'
import { useBillingHook } from '@pages/Billing/Billing'
import { getTrialEndDateMessage } from '@pages/Billing/utils/utils'
import QuickSearch from '@pages/Sessions/SessionsFeedV2/components/QuickSearch/QuickSearch'
import useLocalStorage from '@rehooks/local-storage'
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import { isProjectWithinTrial } from '@util/billing/billing'
import { client } from '@util/graph'
import { useIntegrated } from '@util/integrated'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import { titleCaseString } from '@util/string'
import classNames from 'classnames/bind'
import { H } from 'highlight.run'
import moment from 'moment'
import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSessionStorage } from 'react-use'

import { HighlightLogo } from '../HighlightLogo/HighlightLogo'
import { CommandBar } from './CommandBar/CommandBar'
import styles from './Header.module.scss'

export const Header = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id
	const { isLoggedIn } = useAuthContext()
	const { currentWorkspace } = useApplicationContext()
	const workspaceId = currentWorkspace?.id

	const { pathname } = useLocation()
	const parts = pathname.split('/')
	const currentPage = parts.length >= 3 ? parts[2] : undefined

	const { toggleShowKeyboardShortcutsGuide } = useGlobalContext()
	const { admin } = useAuthContext()

	const pages = [
		{
			key: 'home',
			icon: IconHome,
		},
		{
			key: 'errors',
			icon: IconXCircle,
		},
		{
			key: 'sessions',
			icon: IconPlayCircle,
		},
		{
			key: 'alerts',
			icon: IconSpeakerphone,
		},
	]

	return (
		<>
			<CommandBar />
			<Box background="neutral50" borderBottom="neutral">
				{!!project_id && getBanner(project_id) /** ZANETODO: banner? */}
				<Box
					display="flex"
					alignItems="center"
					px="12"
					py="8"
					justifyContent="space-between"
				>
					{isLoggedIn ||
					projectIdRemapped ===
						DEMO_WORKSPACE_PROXY_APPLICATION_ID ? (
						<Box
							display="flex"
							alignItems="center"
							gap="12"
							style={{ zIndex: 20000 }}
							width="full"
						>
							<ProjectPicker />
							{project_id && (
								<Box display="flex" alignItems="center" gap="4">
									{pages.map((p) => {
										return (
											<LinkButton
												iconLeft={
													<p.icon
														size="14"
														color={
															currentPage ===
															p.key
																? undefined
																: vars.color
																		.neutral700
														}
													/>
												}
												emphasis={
													currentPage === p.key
														? 'high'
														: 'low'
												}
												kind={
													currentPage === p.key
														? 'primary'
														: 'secondary'
												}
												to={`/${project_id}/${p.key}`}
												key={p.key}
											>
												{titleCaseString(p.key)}
											</LinkButton>
										)
									})}
									<Menu>
										<Menu.Button
											icon={
												<IconDotsHorizontal
													size="14"
													color={
														vars.color.neutral500
													}
												/>
											}
											emphasis="low"
											kind="secondary"
										/>
										<Menu.List>
											<Link
												to={`/${project_id}/dashboards`}
												className={linkStyle}
											>
												<Menu.Item>
													<Box
														display="flex"
														alignItems="center"
														gap="4"
													>
														<IconStackedBarChart
															size="14"
															color={
																vars.color
																	.neutral300
															}
														/>
														Dashboards
													</Box>
												</Menu.Item>
											</Link>
											<Link
												to={`/${project_id}/integrations`}
												className={linkStyle}
											>
												<Menu.Item>
													<Box
														display="flex"
														alignItems="center"
														gap="4"
													>
														<IconViewGridAdd
															size="14"
															color={
																vars.color
																	.neutral300
															}
														/>
														Integrations
													</Box>
												</Menu.Item>
											</Link>
											<Link
												to={`/${project_id}/setup`}
												className={linkStyle}
											>
												<Menu.Item>
													<Box
														display="flex"
														alignItems="center"
														gap="4"
													>
														<IconDesktopComputer
															size="14"
															color={
																vars.color
																	.neutral300
															}
														/>
														Setup
													</Box>
												</Menu.Item>
											</Link>
										</Menu.List>
									</Menu>
								</Box>
							)}
						</Box>
					) : (
						<Box className={styles.logoWrapper}>
							<Link
								className={styles.homeLink}
								to={`/${projectIdRemapped}/home`}
							>
								<HighlightLogo />
							</Link>
						</Box>
					)}
					{isLoggedIn && (
						<Box
							display="flex"
							justifyContent="flex-end"
							alignItems="center"
							gap="12"
							style={{ zIndex: 20000 }}
							width="full"
						>
							{!!project_id && (
								<Box className={styles.quicksearchWrapper}>
									<QuickSearch />
								</Box>
							)}
							<Box display="flex" alignItems="center" gap="4">
								{isLoggedIn && <Notifications />}
								<Menu>
									<Menu.Button
										emphasis="low"
										kind="secondary"
										icon={
											<IconCog
												size="14"
												color={vars.color.neutral500}
											/>
										}
									/>
									<Menu.List>
										<Link
											to={`/w/${workspaceId}/team`}
											className={linkStyle}
										>
											<Menu.Item>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconOfficeBuilding
														size="14"
														color={
															vars.color
																.neutral300
														}
													/>
													Workspace settings
												</Box>
											</Menu.Item>
										</Link>
										<Link
											to={`/w/${workspaceId}/account`}
											className={linkStyle}
										>
											<Menu.Item>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconUserCircle
														size="14"
														color={
															vars.color
																.neutral300
														}
													/>
													Account settings
												</Box>
											</Menu.Item>
										</Link>
										<Menu.Divider />
										<Link
											to="/switch"
											className={linkStyle}
										>
											<Menu.Item>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconSwitchHorizontal
														size="14"
														color={
															vars.color
																.neutral300
														}
													/>
													Switch workspace
												</Box>
											</Menu.Item>
										</Link>
										<Menu.Item
											onClick={async () => {
												const sessionId =
													await H.getSessionURL()

												window.Intercom('boot', {
													app_id: 'gm6369ty',
													alignment: 'right',
													hide_default_launcher: true,
													email: admin?.email,
													sessionId,
												})
												window.Intercom(
													'showNewMessage',
												)
											}}
										>
											<Box
												display="flex"
												alignItems="center"
												gap="4"
											>
												<IconQuestionMarkCircle
													size="14"
													color={
														vars.color.neutral300
													}
												/>
												Feedback
											</Box>
										</Menu.Item>
										<a
											href={
												'https://www.highlight.io/docs'
											}
											className={linkStyle}
										>
											<Menu.Item>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconDocumentText
														size="14"
														color={
															vars.color
																.neutral300
														}
													/>
													Documentation
												</Box>
											</Menu.Item>
										</a>
										<Menu.Item
											onClick={() => {
												toggleShowKeyboardShortcutsGuide(
													true,
												)
											}}
										>
											<Box
												display="flex"
												alignItems="center"
												gap="4"
											>
												<IconAtSymbol
													size="14"
													color={
														vars.color.neutral300
													}
												/>
												Shortcuts
											</Box>
										</Menu.Item>
										<Menu.Divider />
										<Menu.Item
											onClick={async () => {
												try {
													auth.signOut()
												} catch (e) {
													console.log(e)
												}
												await client.clearStore()
											}}
										>
											<Box
												display="flex"
												alignItems="center"
												gap="4"
											>
												Log out
											</Box>
										</Menu.Item>
									</Menu.List>
								</Menu>
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</>
	)
}

const getBanner = (project_id: string) => {
	if (isOnPrem) {
		return <OnPremiseBanner />
	} else if (project_id === DEMO_WORKSPACE_APPLICATION_ID) {
		return <DemoWorkspaceBanner />
	} else {
		return <BillingBanner />
	}
}

const BillingBanner = () => {
	const { toggleShowBanner } = useGlobalContext()
	const [temporarilyHideBanner, setTemporarilyHideBanner] = useSessionStorage(
		'highlightHideFreePlanBanner',
		false,
	)
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading } = useGetBillingDetailsForProjectQuery({
		variables: { project_id },
	})
	const [hasReportedTrialExtension, setHasReportedTrialExtension] =
		useLocalStorage('highlightReportedTrialExtension', false)
	const { integrated } = useIntegrated()
	const { issues: billingIssues } = useBillingHook({ project_id })

	useEffect(() => {
		if (
			!hasReportedTrialExtension &&
			data?.workspace_for_project?.trial_extension_enabled
		) {
			analytics.track('TrialExtensionEnabled', {
				project_id,
				workspace_id: data?.workspace_for_project.id,
			})
			setHasReportedTrialExtension(true)
		}
	}, [
		data?.workspace_for_project?.id,
		data?.workspace_for_project?.trial_extension_enabled,
		hasReportedTrialExtension,
		project_id,
		setHasReportedTrialExtension,
	])

	if (billingIssues) {
		toggleShowBanner(true)
		return <BillingIssuesBanner />
	}

	if (loading) {
		toggleShowBanner(false)
		return null
	}

	if (temporarilyHideBanner) {
		toggleShowBanner(false)
		return null
	}

	if (data?.billingDetailsForProject?.plan.type !== PlanType.Free) {
		// If date is Oct 19 in PST timezone, show Product Hunt banner
		const isOct19 = moment().isBetween(
			'2022-10-19T07:00:00Z',
			'2022-10-20T07:00:00Z',
		)
		if (isOct19) {
			toggleShowBanner(true)
			return <ProductHuntBanner />
		}

		toggleShowBanner(false)
		return null
	}

	if (project_id === DEMO_WORKSPACE_APPLICATION_ID) {
		toggleShowBanner(false)
		return null
	}

	let bannerMessage:
		| string
		| React.ReactNode = `You've used ${data?.billingDetailsForProject?.meter}/${data?.billingDetailsForProject?.plan.quota} of your free sessions.`
	const hasTrial = isProjectWithinTrial(data?.workspace_for_project)
	const canExtend = data?.workspace_for_project?.eligible_for_trial_extension
	const hasExceededSessionsForMonth =
		data?.billingDetailsForProject?.meter >
		data?.billingDetailsForProject?.plan.quota

	if (hasTrial) {
		bannerMessage = getTrialEndDateMessage(
			data?.workspace_for_project?.trial_end_date,
		)

		if (canExtend) {
			if (integrated) {
				bannerMessage = (
					<>
						You have unlimited Highlight until{' '}
						{moment(
							data?.workspace_for_project?.trial_end_date,
						).format('MM/DD')}
						.{' '}
						<Link
							className={styles.trialLink}
							to={`/w/${data?.workspace_for_project?.id}/about-you`}
						>
							Fill this out
						</Link>{' '}
						before your trial ends to extend this by another week!
					</>
				)
			} else {
				bannerMessage = (
					<>
						You have unlimited Highlight until{' '}
						{moment(
							data?.workspace_for_project?.trial_end_date,
						).format('MM/DD')}
						.{' '}
						<Link
							className={styles.trialLink}
							to={`/${project_id}/setup`}
						>
							Integrate
						</Link>{' '}
						before your trial ends to extend this by another week!
					</>
				)
			}
		}
	}

	toggleShowBanner(true)

	return (
		<div
			className={classNames(styles.trialWrapper, {
				[styles.error]: hasExceededSessionsForMonth,
			})}
		>
			<div className={classNames(styles.trialTimeText)}>
				{bannerMessage}
				{!canExtend && (
					<>
						{' '}
						Upgrade{' '}
						<Link
							className={styles.trialLink}
							to={`/w/${data?.workspace_for_project?.id}/current-plan`}
						>
							here!
						</Link>
					</>
				)}
			</div>
			{hasTrial && (
				<button
					onClick={() => {
						analytics.track('TemporarilyHideFreePlanBanner', {
							hasTrial,
						})
						setTemporarilyHideBanner(true)
					}}
				>
					<SvgXIcon />
				</button>
			)}
		</div>
	)
}

const OnPremiseBanner = () => {
	const { toggleShowBanner } = useGlobalContext()
	toggleShowBanner(true)

	return (
		<div
			className={styles.trialWrapper}
			style={{
				backgroundColor: 'var(--color-primary-inverted-background)',
			}}
		>
			<div className={classNames(styles.trialTimeText)}>
				Running Highlight On-premise{' '}
				{`v${import.meta.env.REACT_APP_COMMIT_SHA}`}
			</div>
		</div>
	)
}

const DemoWorkspaceBanner = () => {
	const { currentProject, allProjects } = useApplicationContext()
	const { pathname } = useLocation()
	const { toggleShowBanner } = useGlobalContext()

	const redirectLink = getRedirectLink(allProjects, currentProject, pathname)

	toggleShowBanner(true)

	return (
		<div
			className={styles.trialWrapper}
			style={{
				background: 'var(--color-green-600)',
			}}
		>
			<div className={classNames(styles.trialTimeText)}>
				Viewing Demo Project.{' '}
				<Link className={styles.demoLink} to={redirectLink}>
					Go back to your project.
				</Link>
			</div>
		</div>
	)
}

const ProductHuntBanner = () => {
	const { toggleShowBanner } = useGlobalContext()

	toggleShowBanner(true)

	const bannerMessage = (
		<span>
			Highlight is live on Product Hunt 🎉‍{' '}
			<a
				target="_blank"
				href="https://www.producthunt.com/posts/next-js-integration-in-highlight"
				className={styles.trialLink}
				rel="noreferrer"
			>
				Support us
			</a>{' '}
			and we'll be forever grateful ❤️
		</span>
	)

	return (
		<div className={classNames(styles.trialWrapper, styles.productHunt)}>
			<div className={classNames(styles.trialTimeText)}>
				{bannerMessage}
			</div>
		</div>
	)
}

const BillingIssuesBanner = () => {
	const { toggleShowBanner } = useGlobalContext()
	const { currentWorkspace } = useApplicationContext()

	toggleShowBanner(true)

	const bannerMessage = (
		<span>
			Looks like there are some issues with your billing details. 😔{' '}
			<a
				target="_blank"
				href={`/w/${currentWorkspace?.id}/current-plan`}
				className={styles.trialLink}
				rel="noreferrer"
			>
				Please update your payment method here.
			</a>
		</span>
	)

	return (
		<div className={classNames(styles.trialWrapper, styles.error)}>
			<div className={classNames(styles.trialTimeText)}>
				{bannerMessage}
			</div>
		</div>
	)
}

const getRedirectLink = (
	allProjects: Maybe<
		Maybe<
			{
				__typename?: 'Project' | undefined
			} & Pick<Project, 'id' | 'name'>
		>[]
	>,
	currentProject: Project | undefined,
	pathname: string,
): string => {
	const [, path] = pathname.split('/').filter((token) => token.length)
	let toVisit = `/new`

	if (allProjects) {
		if (allProjects[0]?.id !== currentProject?.id) {
			toVisit = `/${allProjects[0]?.id}/${path}`
		} else {
			toVisit = `/${allProjects[allProjects.length - 1]?.id}/${path}`
		}
	}

	return toVisit
}
