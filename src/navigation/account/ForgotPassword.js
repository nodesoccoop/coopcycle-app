import React, {Component} from 'react'
import {Container, Content} from 'native-base'
import {connect} from 'react-redux'
import {withTranslation} from 'react-i18next'
import {resetPassword} from '../../redux/App/actions'
import ForgotPasswordForm from '../../components/ForgotPasswordForm'

class ForgotPassword extends Component {
  componentDidUpdate() {
    // a state when a user successfully requested to reset a password
    if (this.props.isRequested) {
      this.props.navigation.goBack()
    }
  }

  render() {
    return (
      <Container>
        <Content padder>
          <ForgotPasswordForm
            onSubmit={username => {
              const {
                checkEmailRouteName,
                resumeCheckoutAfterActivation,
              } = this.props.navigation.state.params;
              this.props.resetPassword(username, checkEmailRouteName, resumeCheckoutAfterActivation);
            }}
          />
        </Content>
      </Container>
    )
  }
}

function mapStateToProps(state) {
  return {
    isRequested: state.app.forgotPassword.requested,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    resetPassword: (username, checkEmailRouteName, resumeCheckoutAfterActivation) =>
      dispatch(resetPassword(username, checkEmailRouteName, resumeCheckoutAfterActivation)),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ForgotPassword))
