import React from "react";
import {StyleSheet, Text, TouchableOpacity, View, Image, Animated} from "react-native";
import { Item, Input } from "native-base";
import SpinnerButton from "react-native-spinner-button";
import DropdownAlert from "react-native-dropdownalert";
import firebase from "react-native-firebase";
import ErrorModal from "./Components/ErrorModal";
import {CREDENTIALS_EMPTY_ERROR} from "./Utils/Constants";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    _isMounted = false;
    this.state = { email: "", password: "", buttonSpinner: false, modalVisible: false, errorMessage: '' };
    this.setModalVisible = this.setModalVisible.bind(this);
  }
  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  handleLogin = () => {
    const { email, password } = this.state;
    if (!email || !password) {
      this.setState({errorMessage: CREDENTIALS_EMPTY_ERROR});
      this.setModalVisible(true);
      return;
    }
    this.setState({ buttonSpinner: true });
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        if (this._isMounted) {
          this.setState({ buttonSpinner: false });
        }
      })
      .catch(error => {
        if (this._isMounted) {
          this.setState({ buttonSpinner: false });
          this.setState({errorMessage: error.message});
          this.setModalVisible(true);
        }
      });
  };

  render() {
    const { email, password, buttonSpinner } = this.state;
    const logo = require("../assets/images/logo_transparent.png");
    return (
      <>
      <View style={styles.bodyWrapper}>
        <Image style={{ width: 120, height: 120 }} source={logo} />

        <Item rounded style={styles.inputItem}>
          <Input
            style={styles.input}
            keyboardType="email-address"
            onChangeText={email => this.setState({ email })}
            placeholder={"Email address"}
            value={email}
          />
        </Item>
        <Item rounded style={styles.inputItem}>
          <Input
            secureTextEntry={true}
            style={styles.input}
            onChangeText={password => this.setState({ password })}
            placeholder={"Password"}
            value={password}
          />
        </Item>
        <SpinnerButton
          buttonStyle={styles.loginButton}
          isLoading={buttonSpinner}
          onPress={this.handleLogin}
          indicatorCount={10}
          spinnerType="SkypeIndicator"
        >
          <Text style={styles.nextButtonText}>Connect</Text>
        </SpinnerButton>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate("SignUp")}
          style={styles.touchable}
          activeOpacity={0.6}
        >
          <Text style={styles.createAccount}>
            Vous n'avez pas encore un compte?
          </Text>
        </TouchableOpacity>
        <DropdownAlert ref={ref => (this.dropdown = ref)} />
      </View>
        <ErrorModal visible={this.state.modalVisible} setVisible={this.setModalVisible}
    message={this.state.errorMessage}/>
    </>
    );
  }
}

const styles = StyleSheet.create({
  bodyWrapper: {
    height: 550,
    paddingTop: 50,
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  createAccount: {
    textAlign: "center"
  },
  inputItem: {
    marginLeft: "auto",
    marginRight: "auto",
    paddingHorizontal: 10,
    width: 300
  },
  input: {
    fontSize: 15
  },
  loginButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 150,
    borderRadius: 50,
    backgroundColor: "#5CB85C"
  },
  nextButtonText: {
    fontSize: 18,
    color: "#fff"
  }
});
