import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import PropTypes from 'prop-types';
import {showBook, getFavoriteList} from '../../store/reducers/bookRedux';
import BookCard from './BookCard';
import {getFavoriteListIds} from '../../store/selectors/bookingSelector';
import {backgroundColor} from '../../Utils/colors';

const mapStateToProps = (state) => ({
  favoriteList: state.bookStore.favoriteList,
  favoriteListIds: getFavoriteListIds(state),
});
const mapDispatchToProps = (dispatch) => ({
  showBook: (...args) => dispatch(showBook(...args)),
  dipatchFavoriteList: (...args) => dispatch(getFavoriteList(...args)),
});
const renderSeparator = () => {
  return (
    <View
      style={{
        height: 1,
        width: '86%',
        backgroundColor: '#CED0CE',
        marginLeft: '14%',
      }}
    />
  );
};

const BookFavoriteList = ({
  favoriteList,
  dipatchFavoriteList,
  navigation,
  favoriteListIds,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (favoriteList) {
      setIsLoading(false);
    } else {
      dipatchFavoriteList();
    }
  }, [dipatchFavoriteList, favoriteList]);

  const handleShowBook = (item) => {
    showBook(item.id);
    navigation.navigate('BookDetails', {
      bookId: item.id,
      bookTitle: item.title,
    });
  };

  const renderItem = ({item}) => {
    const isFavorited = () => {
      return favoriteListIds.includes(item.id);
    };
    return (
      <BookCard
        data={{...item, isFavorited: isFavorited()}}
        showBook={handleShowBook}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }
  return (
    <SafeAreaView style={{marginTop: 0, backgroundColor, flex: 1}}>
      <FlatList
        data={favoriteList}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.id}`}
        ItemSeparatorComponent={renderSeparator}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
};
BookFavoriteList.navigationOptions = {
  headerTitle: 'Liste des favoris',
};

BookFavoriteList.propTypes = {
  favoriteList: PropTypes.array,
  dipatchFavoriteList: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  favoriteListIds: PropTypes.array,
};

export default connect(mapStateToProps, mapDispatchToProps)(BookFavoriteList);
