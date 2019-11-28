/* eslint-disable react/static-property-placement */
/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Starred,
  Stars,
  Info,
  Title,
  OwnerAvatar,
  Author,
  Loading,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loadingStarredRepo: true,
    page: 1,
    refreshing: false,
  };

  async componentDidMount() {
    this.loadStarred();
  }

  loadStarred = async (page = 1) => {
    const { navigation } = this.props;
    const { stars } = this.state;

    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      loadingStarredRepo: false,
      refreshing: false,
      page,
    });
  };

  loadMore = () => {
    const { page } = this.state;

    const nextPage = page + 1;

    this.loadStarred(nextPage);
  };

  refreshList = () => {
    this.setState({ stars: [], page: 1, refreshing: true });
    this.loadStarred();
  };

  render() {
    const { navigation } = this.props;
    const { stars, loadingStarredRepo, refreshing } = this.state;
    const user = navigation.getParam('user');
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loadingStarredRepo ? (
          <Loading>
            <ActivityIndicator size="large" color="#715981" />
          </Loading>
        ) : (
          <Stars
            data={stars}
            onRefresh={this.refreshList} // Função dispara quando o usuário arrasta a lista pra baixo
            refreshing={refreshing}
            onEndReachedThreshold={0.2} // Carrega mais itens quando chegar em 20% do fim
            onEndReached={this.loadMore}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
