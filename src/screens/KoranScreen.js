/* eslint-disable react-native/no-inline-styles */
/* eslint-disable array-callback-return */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
  YellowBox,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import {Button} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import {formatDateWithDayAndMonthName} from '../Utils/Functions';
import KoranItem from '../Components/KoranScreen/KoranItem';
import AssociationMenu from '../Components/AssociationMenu';
import {
  ayncReceiveKhatma,
  asyncReceiveUserKhatma,
} from '../store/reducers/khatmaRedux';
import {receiveKoran} from '../store/reducers/koranRedux';
import {
  white,
  gray3,
  black,
  gray,
  orange2,
  orangeBackgroud,
} from '../Utils/colors';
import HistoryItem from '../Components/KoranScreen/HistoryItem';
import {isAdmin} from '../Utils/Account';

YellowBox.ignoreWarnings([
  'VirtualizedLists should never be nested', // TODO: Remove when fixed
]);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orangeBackgroud,
    paddingTop: 0,
  },
  textHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: black,
  },
  panelHandle: {
    height: 5,
    width: 50,
    backgroundColor: orange2,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 6,
  },
});

const {width, height} = Dimensions.get('window');

class KoranScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      _draggedValue: new Animated.Value(-20),
      dragRange: {
        top: height - 20,
        bottom: 0,
      },
    };
  }

  onRefresh = () => {
    const {dispatch} = this.props;
    dispatch(ayncReceiveKhatma());
    dispatch(asyncReceiveUserKhatma());
  };

  componentDidMount = () => {
    const {dispatch} = this.props;
    dispatch(ayncReceiveKhatma());
    dispatch(asyncReceiveUserKhatma());
    dispatch(receiveKoran());
  };

  renderKoranItem = ({item}) => {
    const {navigation, loading} = this.props;
    const date = formatDateWithDayAndMonthName(item.beginAt);
    let numberofPartDispo = 0;

    // eslint-disable-next-line array-callback-return
    Object.values(item.takharoubts).map((takharoubt) => {
      if (takharoubt.pickedTimes === 0) {
        numberofPartDispo += 1;
      }
    });

    return (
      <KoranItem
        key={item.id.toString()}
        title={date}
        numberofPartDispo={numberofPartDispo}
        loading={loading}
        associationName={item.association.name}
        navigate={() => navigation.navigate('Khatma', {khatmaIdParam: item.id})}
      />
    );
  };

  renderHistoryItem = ({item}) => {
    const {navigation, loading} = this.props;
    const date = formatDateWithDayAndMonthName(item.beginAt);
    const numberOfPicks = item.userTakharoubts.length;
    let numberOfRead = 0;

    Object.values(item.userTakharoubts).map((takharoubt) => {
      if (takharoubt.isRead) {
        numberOfRead += 1;
      }
    });

    return (
      <HistoryItem
        key={item.id.toString()}
        title={date}
        numberOfPicks={numberOfPicks}
        numberOfRead={numberOfRead}
        loading={loading}
        associationName={item.association.name}
        navigate={() => navigation.navigate('Khatma', {khatmaIdParam: item.id})}
      />
    );
  };

  render() {
    const {khatmaHistory, openKhatma, loading, account} = this.props;
    const {dragRange, _draggedValue} = this.state;

    return (
      <View style={styles.container}>
        <AssociationMenu screenerTitle="Khatma" />
        <ScrollView scrollEventThrottle={16}>
          <View style={{marginTop: 15, paddingHorizontal: 15}}>
            <Text style={styles.textHeader}>Mes Prochaines Khatma</Text>
          </View>
          <View style={{flex: 1}}>
            {openKhatma.length === 0 && (
              <View style={{marginTop: 10, paddingHorizontal: 15}}>
                <Text style={styles.textDetails}>
                  Aucune Khatma n'est ouverte à ce jour.
                </Text>
              </View>
            )}
          </View>
          <FlatList
            data={Object.values(openKhatma).sort((a, b) => {
              const dateA = new Date(a.beginAt);
              const dateB = new Date(b.beginAt);
              return dateB - dateA;
            })}
            keyExtractor={(item) => item.id.toString()}
            renderItem={this.renderKoranItem}
            horizontal
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={this.onRefresh}
                title="Chargement..."
              />
            }
          />
          <View style={{flex: 1}}>
            <SlidingUpPanel
              ref={(c) => (this._panel = c)}
              draggableRange={dragRange}
              animatedValue={_draggedValue}
              backdropOpacity={0}
              snappingPoints={[360]}
              height={height - 20}
              friction={0.9}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: white,
                  borderRadius: 24,
                  padding: 14,
                }}>
                <View style={styles.panelHandle} />
                <View>
                  <Text style={styles.textHeader}>Mon Historique</Text>
                </View>
                <View style={{marginBottom: 10, marginTop: 15}}>
                  {khatmaHistory.length === 0 && (
                    <View style={{marginBottom: 10, paddingHorizontal: 15}}>
                      <Text style={styles.textDetails}>
                        Vous n'avez à ce jour partcipé à aucune Khatma
                      </Text>
                    </View>
                  )}
                  <FlatList
                    data={Object.values(khatmaHistory).sort((a, b) => {
                      const dateA = new Date(a.beginAt);
                      const dateB = new Date(b.beginAt);
                      return dateB - dateA;
                    })}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={this.renderHistoryItem}
                  />
                </View>
              </View>
            </SlidingUpPanel>
          </View>
        </ScrollView>
        {isAdmin(account.user) && (
          <View
            style={{
              flexDirection: 'row-reverse',
            }}>
            <Button
              transparent
              style={{
                borderRadius: 50,
                marginRight: 20,
                marginBottom: 10,
                width: 46,
                backgroundColor: orange2,
                justifyContent: 'center',
              }}
              onPress={() => this.props.navigation.navigate('AddKhatma')}>
              <Icon
                name="plus"
                color={white}
                size={24}
                style={{alignSelf: 'center', justifyContent: 'center'}}
              />
            </Button>
          </View>
        )}
      </View>
    );
  }
}

function mapStateToProps(state) {
  const {userAssociationList} = state.associationStore;

  const openKhatma = Object.values(state.khatmaStore.khatma).filter(
    (khatma) => {
      return (
        khatma.isOpen &&
        Object.values(userAssociationList).includes(khatma.association.id)
      );
    },
  );

  const khatmaHistory = Object.values(state.khatmaStore.userKhatma).filter(
    (khatma) => {
      return (
        !khatma.isOpen &&
        khatma.userTakharoubts.length > 0 &&
        Object.values(userAssociationList).includes(khatma.association.id)
      );
    },
  );

  return {
    khatmaHistory,
    openKhatma,
    loading: state.khatmaStore.loading || state.associationStore.loading,
    account: state.accountStore,
  };
}

KoranScreen.propTypes = {
  khatmaHistory: PropTypes.array,
  openKhatma: PropTypes.array,
  loading: PropTypes.bool,
  navigation: PropTypes.object,
  dispatch: PropTypes.func,
  account: PropTypes.object,
};

export default connect(mapStateToProps)(KoranScreen);
