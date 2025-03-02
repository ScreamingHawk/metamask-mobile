import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import { getHost } from '../../../util/browser';
import { strings } from '../../../../locales/i18n';
import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import WebsiteIcon from '../WebsiteIcon';
import ActionView from '../ActionView';
import AccountInfoCard from '../AccountInfoCard';
import TransactionHeader from '../TransactionHeader';
import WarningMessage from '../../Views/SendFlow/WarningMessage';
import Device from '../../../util/Device';
import Analytics from '../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';

const styles = StyleSheet.create({
	root: {
		backgroundColor: colors.white,
		paddingTop: 24,
		minHeight: '90%',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingBottom: Device.isIphoneX() ? 20 : 0
	},
	expandedHeight2: {
		minHeight: '90%'
	},
	expandedHeight1: {
		minHeight: '90%'
	},
	signingInformation: {
		alignItems: 'center',
		marginVertical: 24
	},
	domainLogo: {
		width: 40,
		height: 40,
		marginRight: 8,
		borderRadius: 20
	},
	messageColumn: {
		width: '75%',
		justifyContent: 'space-between'
	},
	warningLink: {
		...fontStyles.normal,
		color: colors.blue,
		textAlign: 'center',
		paddingHorizontal: 10,
		paddingBottom: 10,
		textDecorationLine: 'underline'
	},
	signText: {
		...fontStyles.bold,
		fontSize: 20,
		textAlign: 'center'
	},
	messageLabelText: {
		...fontStyles.bold,
		fontSize: 16,
		marginBottom: 4
	},
	readMore: {
		color: colors.blue,
		fontSize: 14,
		...fontStyles.bold
	},
	warningWrapper: {
		width: '100%',
		paddingHorizontal: 24,
		paddingTop: 24
	},
	actionViewChild: {
		paddingHorizontal: 24
	},
	accountInfoCardWrapper: {
		marginBottom: 20,
		width: '100%'
	},
	children: {
		alignSelf: 'center',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		width: '100%',
		borderWidth: 1,
		borderColor: colors.grey200,
		borderRadius: 10,
		padding: 16
	},
	arrowIconWrapper: {
		flexGrow: 1,
		alignItems: 'flex-end'
	},
	arrowIcon: {
		color: colors.grey200
	}
});

/**
 * PureComponent that renders scrollable content inside signature request user interface
 */
class SignatureRequest extends PureComponent {
	static propTypes = {
		/**
		 * Object representing the navigator
		 */
		navigation: PropTypes.object,
		/**
		 * Callback triggered when this message signature is rejected
		 */
		onCancel: PropTypes.func,
		/**
		 * Callback triggered when this message signature is approved
		 */
		onConfirm: PropTypes.func,
		/**
		 * Content to display above the action buttons
		 */
		children: PropTypes.node,
		/**
		 * Object containing current page title and url
		 */
		currentPageInformation: PropTypes.object,
		/**
		 * String representing signature type
		 */
		type: PropTypes.string,
		/**
		 * String representing the selected network
		 */
		networkType: PropTypes.string,
		/**
		 * Whether it should display the warning message
		 */
		showWarning: PropTypes.bool,
		/**
		 * Whether it should render the expand arrow icon
		 */
		truncateMessage: PropTypes.bool,
		/**
		 * Expands the message box on press.
		 */
		toggleExpandedMessage: PropTypes.func
	};

	/**
	 * Calls trackCancelSignature and onCancel callback
	 */
	onCancel = () => {
		this.props.onCancel();
		Analytics.trackEventWithParameters(
			ANALYTICS_EVENT_OPTS.TRANSACTIONS_CANCEL_SIGNATURE,
			this.getTrackingParams()
		);
	};

	/**
	 * Calls trackConfirmSignature and onConfirm callback
	 */
	onConfirm = () => {
		this.props.onConfirm();
		Analytics.trackEventWithParameters(
			ANALYTICS_EVENT_OPTS.TRANSACTIONS_CONFIRM_SIGNATURE,
			this.getTrackingParams()
		);
	};

	/**
	 * Returns corresponding tracking params to send
	 *
	 * @return {object} - Object containing network and functionType
	 */
	getTrackingParams = () => {
		const { type, networkType } = this.props;
		return {
			network: networkType,
			functionType: type
		};
	};

	goToWarning = () => {
		this.props.onCancel();
		this.props.navigation.push('Webview', {
			url: 'https://metamask.zendesk.com/hc/en-us/articles/360015488751',
			title: 'metamask.zendesk.com'
		});
	};

	renderWarning = () => (
		<Text>
			{strings('signature_request.eth_sign_warning')}
			{` `}
			<Text style={styles.warningLink}>{strings('signature_request.learn_more')}</Text>
		</Text>
	);

	renderActionViewChildren = () => {
		const { children, currentPageInformation, truncateMessage, toggleExpandedMessage } = this.props;
		const url = currentPageInformation.url;
		const title = getHost(url);
		const arrowIcon = truncateMessage ? this.renderArrowIcon() : null;
		return (
			<View style={styles.actionViewChild}>
				<View style={styles.accountInfoCardWrapper}>
					<AccountInfoCard operation="signing" />
				</View>
				<TouchableOpacity style={styles.children} onPress={truncateMessage ? toggleExpandedMessage : null}>
					<WebsiteIcon style={styles.domainLogo} title={title} url={url} />
					<View style={styles.messageColumn}>
						<Text style={styles.messageLabelText}>{strings('signature_request.message')}:</Text>
						{children}
						{truncateMessage ? (
							<Text style={styles.readMore}>{strings('signature_request.read_more')}</Text>
						) : null}
					</View>
					<View style={styles.arrowIconWrapper}>{arrowIcon}</View>
				</TouchableOpacity>
			</View>
		);
	};

	renderArrowIcon = () => (
		<View style={styles.arrowIconWrapper}>
			<Ionicons name={'ios-arrow-forward'} size={20} style={styles.arrowIcon} />
		</View>
	);

	render() {
		const { showWarning, currentPageInformation, type } = this.props;
		let expandedHeight;
		if (Device.isMediumDevice()) {
			expandedHeight = styles.expandedHeight2;
		} else if (type === 'ethSign' && Device.isMediumDevice()) {
			expandedHeight = styles.expandedHeight1;
		}
		return (
			<View style={[styles.root, expandedHeight]}>
				<ActionView
					cancelTestID={'request-signature-cancel-button'}
					confirmTestID={'request-signature-confirm-button'}
					cancelText={strings('signature_request.cancel')}
					confirmText={strings('signature_request.sign')}
					onCancelPress={this.onCancel}
					onConfirmPress={this.onConfirm}
					confirmButtonMode="sign"
				>
					<View>
						<TransactionHeader currentPageInformation={currentPageInformation} type={type} />
						<View style={styles.signingInformation}>
							<Text style={styles.signText}>{strings('signature_request.signing')}</Text>
							{showWarning ? (
								<TouchableOpacity style={styles.warningWrapper} onPress={this.goToWarning}>
									<WarningMessage warningMessage={this.renderWarning()} />
								</TouchableOpacity>
							) : null}
						</View>
						{this.renderActionViewChildren()}
					</View>
				</ActionView>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	networkType: state.engine.backgroundState.NetworkController.provider.type
});

export default connect(mapStateToProps)(SignatureRequest);
