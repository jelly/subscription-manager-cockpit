/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import React from 'react';
import subscriptionsClient from './subscriptions-client';
import { InsightsStatus } from './insights.jsx';
import { EmptyStatePanel } from "cockpit-components-empty-state.jsx";
import { ListingTable } from "cockpit-components-table.jsx";
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import {
    Alert, AlertGroup, AlertActionCloseButton, Button,
    Card, CardActions, CardBody, CardHeader, CardHeaderMain, CardTitle,
    DescriptionList, DescriptionListDescription, DescriptionListGroup, DescriptionListTerm,
    Gallery, Label, Page, PageSection, Split, SplitItem, Text, TextVariants,
    EmptyState, EmptyStateVariant, EmptyStateBody
} from '@patternfly/react-core';

let _ = cockpit.gettext;

class InstalledProducts extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let columnTitles = [_("Product name")];

        let sca_mode;

        sca_mode = false;
        if (this.props.org) {
            if ("contentAccessMode" in this.props.org) {
                if (this.props.org.contentAccessMode === "org_environment") {
                    sca_mode = true;
                }
            }
        }

        let card_actions;
        let is_registered = (this.props.status !== 'unknown');
        let entries = this.props.products.map(function (itm) {
            let status_color;
            let status_text;
            let label_status_text;
            let start_date_text;
            let end_date_text;
            let body;
            let columns;

            if (itm.status === 'subscribed') {
                status_color = "green";
                label_status_text = _("Subscribed");
                status_text = label_status_text;
            } else if (itm.status === 'partially_subscribed') {
                status_color = "orange";
                label_status_text = _("Partially subscribed");
                status_text = cockpit.format(
                    _("Partially subscribed ($0)"), itm.status_details.join(',')
                );
            } else if (itm.status === 'not_subscribed') {
                status_color = "red";
                label_status_text = _("Not subscribed");
                status_text = cockpit.format(
                    _("Not subscribed ($0)"), itm.status_details.join(',')
                );
            } else {
                console.debug('Other state:', itm.status);
                status_color = "red";
                label_status_text = _("Unknown status");
                status_text = label_status_text;
            }

            if (itm.starts.length === 0) {
                start_date_text = _("Unknown");
            } else {
                start_date_text = new Date(Date.parse(itm.starts)).toLocaleDateString();
            }

            if (itm.ends.length === 0) {
                end_date_text = _("Unknown");
            } else {
                end_date_text = new Date(Date.parse(itm.ends)).toLocaleDateString();
            }

            if (sca_mode || ! is_registered) {
                columns = [
                    {
                        title: (<Split>
                            <SplitItem isFilled>
                                {itm.productName}
                            </SplitItem>
                        </Split>),
                        header: true,
                    }
                ];
            } else {
                columns = [
                    {
                        title: (<Split>
                            <SplitItem isFilled>
                                {itm.productName}
                            </SplitItem>
                            <SplitItem>
                                <Label
                                    color={status_color}>{label_status_text}</Label>
                            </SplitItem>
                        </Split>),
                        header: true,
                    }
                ];
            }

            let attr_list;
            attr_list = [
                <DescriptionListGroup key="product_name">
                    <DescriptionListTerm>{_("Product name")}</DescriptionListTerm>
                    <DescriptionListDescription>{itm.productName}</DescriptionListDescription>
                </DescriptionListGroup>,
                <DescriptionListGroup key="product_id">
                    <DescriptionListTerm>{_("Product ID")}</DescriptionListTerm>
                    <DescriptionListDescription>{itm.productId}</DescriptionListDescription>
                </DescriptionListGroup>,
                <DescriptionListGroup key="product_version">
                    <DescriptionListTerm>{_("Version")}</DescriptionListTerm>
                    <DescriptionListDescription>{itm.version}</DescriptionListDescription>
                </DescriptionListGroup>,
                <DescriptionListGroup key="product_arch">
                    <DescriptionListTerm>{_("Arch")}</DescriptionListTerm>
                    <DescriptionListDescription>{itm.arch}</DescriptionListDescription>
                </DescriptionListGroup>
            ];

            if (! sca_mode && is_registered) {
                attr_list.push(
                    <DescriptionListGroup key="product_status">
                        <DescriptionListTerm>{_("Status")}</DescriptionListTerm>
                        <DescriptionListDescription>{status_text}</DescriptionListDescription>
                    </DescriptionListGroup>,
                    <DescriptionListGroup key="product_start_date">
                        <DescriptionListTerm>{_("Starts")}</DescriptionListTerm>
                        <DescriptionListDescription>{start_date_text}</DescriptionListDescription>
                    </DescriptionListGroup>,
                    <DescriptionListGroup key="product_end_date">
                        <DescriptionListTerm>{_("Ends")}</DescriptionListTerm>
                        <DescriptionListDescription>{end_date_text}</DescriptionListDescription>
                    </DescriptionListGroup>
                );
            }

            body = (
                <DescriptionList isHorizontal>
                    {attr_list}
                </DescriptionList>
            );

            return ({
                props: { key: itm.productId, 'data-row-id': itm.productName },
                columns,
                hasPadding: true,
                expandedContent: body,
            });
        });

        return (
            <Card id="products" className="products" key="products">
                <CardHeader>
                    <CardTitle><Text component={TextVariants.h2}>{_("Installed products")}</Text></CardTitle>
                    { card_actions }
                </CardHeader>
                <CardBody className="contains-list">
                    <ListingTable aria-label={_("Installed products")}
                      variant='compact'
                      showHeader={false}
                      emptyCaption={_("No installed products detected")}
                      columns={columnTitles}
                      rows={entries} />
                </CardBody>
            </Card>
        );
    }
}

/* Show subscriptions status of the system, offer to register/unregister the system
 * Expected properties:
 * status       subscription status ID
 * status_msg   subscription status message
 * error        error message to show (in Curtains if not connected, as a dismissable alert otherwise)
 * syspurpose
 * syspurpose_status
 * dismissError callback, triggered for the dismissable error in connected state
 * register     callback, triggered when user clicks on register
 * unregister   callback, triggered when user clicks on unregister
 */
class SubscriptionStatus extends React.Component {
    constructor(props) {
        super(props);
        this.handleRegisterSystem = this.handleRegisterSystem.bind(this);
        this.handleUnregisterSystem = this.handleUnregisterSystem.bind(this);
    }

    handleRegisterSystem(err) {
        // only consider primary mouse button
        if (!err || err.button !== 0)
            return;
        if (this.props.register)
            this.props.register();
        err.stopPropagation();
    }

    handleUnregisterSystem(e) {
        // only consider primary mouse button
        if (!e || e.button !== 0)
            return;
        if (this.props.unregister)
            this.props.unregister();
        e.stopPropagation();
    }

    render() {
        // Try to detect SCA mode first
        let sca_mode;
        let org_name;
        sca_mode = false;
        if (this.props.org === undefined) {
            org_name = '';
        } else {
            // Organization name
            if ('displayName' in this.props.org) {
                org_name = this.props.org['displayName'];
            } else {
                org_name = '';
            }
            // SCA mode tooltip
            if ('contentAccessMode' in this.props.org) {
                if (this.props.org['contentAccessMode'] === 'org_environment') {
                    sca_mode = true;
                }
            }
        }

        // Display system purpose only in the case, when it make sense
        let syspurpose = null;
        let syspurpose_card_body;

        const p = this.props.syspurpose;
        if ( p["service_level_agreement"] || p["usage"] || p["role"] || p["addons"] ) {
            syspurpose_card_body = (
                <DescriptionList isHorizontal>
                    {p["service_level_agreement"] &&
                        <DescriptionListGroup>
                            <DescriptionListTerm>{_("Service level")}</DescriptionListTerm>
                            <DescriptionListDescription>{p["service_level_agreement"]}</DescriptionListDescription>
                        </DescriptionListGroup>
                    }
                    {p["usage"] &&
                        <DescriptionListGroup>
                            <DescriptionListTerm>{_("Usage")}</DescriptionListTerm>
                            <DescriptionListDescription>{p["usage"]}</DescriptionListDescription>
                        </DescriptionListGroup>
                    }
                    {p["role"] &&
                        <DescriptionListGroup>
                            <DescriptionListTerm>{_("Role")}</DescriptionListTerm>
                            <DescriptionListDescription>{p["role"]}</DescriptionListDescription>
                        </DescriptionListGroup>
                    }
                    {p["addons"] &&
                        <DescriptionListGroup>
                            <DescriptionListTerm>{_("Add-ons")}</DescriptionListTerm>
                            <DescriptionListDescription>{p["addons"]}</DescriptionListDescription>
                        </DescriptionListGroup>
                    }
                </DescriptionList>
            );
        } else {
            syspurpose_card_body = (
                <div>
                    <EmptyState variant={EmptyStateVariant.small}>
                        <EmptyStateBody>
                            {_("No system purpose attributes set")}
                        </EmptyStateBody>
                    </EmptyState>
                </div>
            );
        }

        syspurpose = (
            <Card id="syspurpose" key="syspurpose" className="ct-card-info">
                <CardHeader>
                    <CardHeaderMain>
                        <Text className="purpose-header" component={TextVariants.h2}>{_("System purpose")}</Text>
                    </CardHeaderMain>
                </CardHeader>
                <CardBody>
                    {syspurpose_card_body}
                </CardBody>
            </Card>
        );

        let status_text;
        let action;

        if (this.props.status === 'unknown') {
            status_text = _("Not registered");
            action = (
                <Button onClick={this.handleRegisterSystem}>{_("Register")}</Button>
            );
        } else {
            const isUnregistering = (this.props.status === "unregistering");
            status_text = sca_mode ? _("Registered") : this.props.status_msg;
            action = (
                <Button isDisabled={isUnregistering} isLoading={isUnregistering}
                              onClick={this.handleUnregisterSystem}>{isUnregistering ? _("Unregistering"): _("Unregister")}</Button>
            );
        }

        return (
            <>
                <Card id="overview" key="overview" className={ syspurpose !== null ? "ct-card-info" : "" }>
                    <CardHeader>
                        <CardTitle><Text component={TextVariants.h2}>{_("Overview")}</Text></CardTitle>
                        <CardActions>{action}</CardActions>
                    </CardHeader>
                    <CardBody>
                        <DescriptionList isHorizontal>
                            <DescriptionListGroup>
                                <DescriptionListTerm>{_("Status")}</DescriptionListTerm>
                                <DescriptionListDescription>
                                    {status_text}
                                </DescriptionListDescription>
                            </DescriptionListGroup>
                            {org_name &&
                                <DescriptionListGroup>
                                    <DescriptionListTerm>{_("Organization")}</DescriptionListTerm>
                                    <DescriptionListDescription>{org_name}</DescriptionListDescription>
                                </DescriptionListGroup>
                            }
                            {(this.props.insights_available && this.props.status !== 'unknown') && <InsightsStatus />}
                        </DescriptionList>
                    </CardBody>
                </Card>
                {syspurpose}
            </>
        );
    }
}

/* Show subscriptions status of the system and registered products, offer to register/unregister the system
 * Expected properties:
 * status       subscription status ID
 * status_msg   subscription status message
 * error        error message to show (in EmptyState if not connected, as a dismissable alert otherwise
 * dismissError callback, triggered for the dismissable error in connected state
 * products     subscribed products (properties as in subscriptions-client)
 * register     callback, triggered when user clicks on register
 * unregister   callback, triggered when user clicks on unregister
 */
class SubscriptionsView extends React.Component {
    /*
     * Render a "loading" view.
     */
    renderLoading() {
        let message = _("Updating");
        let description = _("Retrieving subscription status...");
        return <EmptyStatePanel paragraph={description} loading title={message} />;
    }

    /*
     * Render an error view representing an error status & message.
     */
    renderError(status, status_msg) {
        let description;
        let message;

        if (status === "service-unavailable") {
            message = _("The rhsm service is unavailable. Make sure subscription-manager is installed \
and try reloading the page. Additionally, make sure that you have checked the \
'Reuse my password for privileged tasks' checkbox on the login page.");
            description = _("Unable to the reach the rhsm service.");
        } else if (status === 'access-denied') {
            message = _("Access denied");
            description = _("The current user isn't allowed to access system subscription status.");
        } else {
            message = _("Unable to connect");
            description = cockpit.format(
                _("Couldn't get system subscription status. Please ensure subscription-manager \
is installed. Reported status: $0 ($1)"),
                status_msg,
                status,
            );
        }

        return <EmptyStatePanel icon={ExclamationCircleIcon} paragraph={description} loading={false} title={message} />;
    }

    renderSubscriptions() {
        let error = null;
        if (this.props.error) {
            let severity = this.props.error.severity || "danger";
            if (severity === "error")
                severity = "danger";
            error = (
                <AlertGroup isToast>
                    <Alert isLiveRegion variant={severity} title={this.props.error.msg}
                        actionClose={<AlertActionCloseButton onClose={this.props.dismissError} />} />
                </AlertGroup>
            );
        }

        return (
            <Page>
                <PageSection>
                    {error}
                    <Gallery className='ct-cards-grid' hasGutter>
                        <SubscriptionStatus { ...this.props } />
                        <InstalledProducts { ...this.props } />
                    </Gallery>
                </PageSection>
            </Page>
        );
    }

    render() {
        let status = this.props.status;
        let status_msg = this.props.status_msg;
        let loaded = subscriptionsClient.config.loaded;
        if (status === 'not-found' ||
            status === 'access-denied' ||
            status === 'service-unavailable') {
            return this.renderError(status, status_msg);
        } else if (!loaded || status === undefined) {
            return this.renderLoading();
        } else {
            return this.renderSubscriptions();
        }
    }
}

export default SubscriptionsView;
