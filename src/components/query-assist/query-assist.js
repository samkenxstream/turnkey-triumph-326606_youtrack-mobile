/* @flow */

import React, {Component} from 'react';
import {View, TouchableOpacity, TextInput} from 'react-native';

import debounce from 'lodash.debounce';
import {View as AnimatedView} from 'react-native-animatable';

import KeyboardSpacerIOS from '../platform/keyboard-spacer.ios';
import ModalPortal from '../modal-view/modal-portal';
import ModalView from '../modal-view/modal-view';
import QueryAssistSuggestionsList from './query-assist__suggestions-list';
import {HIT_SLOP} from '../common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {IconBack, IconClose} from '../icon/icon';

import styles from './query-assist.styles';

import type {Node} from 'react';
import type {TransformedSuggestion, SavedQuery} from 'flow/Issue';


const SHOW_LIST_ANIMATION_DURATION = 500;

type Props = {
  suggestions: Array<TransformedSuggestion | SavedQuery>,
  currentQuery: string,
  onApplyQuery: (query: string) => any,
  onChange: (query: string, caret: number) => any,
  onClose: (query: string) => any
};

type State = {
  inputValue: string,
  caret: number,
  queryCopy: string,
  suggestionsListTop: number
}

export class QueryAssist extends Component<Props, State> {
  queryAssistContainer: ?Object;
  lastQueryParams: { query: string, caret: number } = {query: '', caret: 0};
  initialState: State = {
    inputValue: '',
    caret: 0,
    queryCopy: '',
    suggestionsListTop: 0,
  };

  constructor(props: Props) {
    super(props);
    this.state = Object.assign({}, this.initialState);
  }

  onSearch: any = debounce((query: string, caret: number) => {
    if (this.lastQueryParams.query === query || this.lastQueryParams.caret === caret) {
      return;
    }

    this.lastQueryParams = {query, caret};
    this.setState({inputValue: query, caret});
    this.props.onChange(query, caret);

  }, 100);

  resetState: (() => void) = () => {
    this.setState(this.initialState);
  };

  blurInput() {
    this.refs.searchInput.blur();
  }

  focusInput() {
    this.refs.searchInput.focus();
  }

  cancelSearch() {
    this.blurInput();
    this.setState({inputValue: this.state.queryCopy});
  }

  beginEditing() {
    let {inputValue} = this.state;
    inputValue = inputValue || '';
    this.setState({
      queryCopy: inputValue,
      suggestionsListTop: 0,
    });

    this.props.onChange(inputValue, inputValue.length);
  }

  onSubmitEditing = () => {
    this.blurInput();
    this.props.onApplyQuery(this.state.inputValue || '');
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    if (newProps.currentQuery !== this.props.currentQuery) {
      this.setState({inputValue: newProps.currentQuery});
    }
  }

  componentDidMount() {
    this.setState({inputValue: this.props.currentQuery});
  }

  onApplySuggestion: ((suggestion: TransformedSuggestion) => void) = (suggestion: TransformedSuggestion) => {
    const suggestionText = `${suggestion.prefix}${suggestion.option}${suggestion.suffix}`;
    const oldQuery = this.state.inputValue || '';
    const leftPartAndNewQuery = oldQuery.substring(0, suggestion.completionStart) + suggestionText;
    const newQuery = leftPartAndNewQuery + oldQuery.substring(suggestion.completionEnd);
    this.setState({inputValue: newQuery});
    this.focusInput();
    this.props.onChange(newQuery, leftPartAndNewQuery.length);
  };

  onApplySavedQuery: ((savedQuery: SavedQuery) => void) = (savedQuery: SavedQuery) => {
    this.setState({inputValue: savedQuery.query});
    this.blurInput();
    this.props.onApplyQuery(savedQuery.query);
  };

  onClose = (): void => {
    this.cancelSearch();
    this.props.onClose(this.state.inputValue);
  }

  renderClearIcon(): Node {
    return (
      <TouchableOpacity
        onPress={this.resetState}
        hitSlop={HIT_SLOP}
        style={styles.clearIcon}
      >
        <IconClose size={13} color={styles.clearIcon.color}/>
      </TouchableOpacity>
    );
  }

  renderCloseButton() {
    return <IconBack color={styles.link.color}/>;
  }

  _renderInput() {
    const {inputValue} = this.state;

    return (
      <View
        style={[
          styles.inputWrapper,
          styles.inputWrapperActive,
        ]}
        ref={node => this.queryAssistContainer = node}
      >

        <TouchableOpacity
          testID="query-assist-cancel"
          accessibilityLabel="query-assist-cancel"
          accessible={true}
          onPress={this.onClose}
        >
          {this.renderCloseButton()}
        </TouchableOpacity>

        <TextInput
          ref="searchInput"

          testID="query-assist-input"
          accessibilityLabel="query-assist-input"
          accessible={true}
          style={styles.searchInput}

          placeholderTextColor={styles.clearIcon.color}
          placeholder={i18n('Enter search request')}

          clearButtonMode="never"
          returnKeyType="search"
          autoFocus={true}
          autoCorrect={false}
          underlineColorAndroid="transparent"
          autoCapitalize="none"

          onFocus={() => this.beginEditing()}

          onSubmitEditing={() => this.onSubmitEditing()}
          onChangeText={text => this.setState({inputValue: text})}
          onSelectionChange={event => this.onSearch(inputValue, event.nativeEvent.selection.start)}

          value={inputValue}
        />

        {!!inputValue && this.renderClearIcon()}
      </View>
    );
  }

  _renderSuggestions() {
    const {suggestions} = this.props;
    return (
      <AnimatedView
        style={styles.suggestContainer}
        animation="fadeIn"
        useNativeDriver
        duration={SHOW_LIST_ANIMATION_DURATION}
      >
        <QueryAssistSuggestionsList
          suggestions={suggestions}
          onApplySuggestion={this.onApplySuggestion}
          onApplySavedQuery={this.onApplySavedQuery}
        />
      </AnimatedView>
    );
  }

  render() {
    return (
      <ModalView
        visible={true}
        animationType="fade"
        style={styles.modal}
      >
        {this._renderInput()}
        {this._renderSuggestions()}
        <KeyboardSpacerIOS/>
      </ModalView>
    );
  }
}


export class QueryAssistModal extends QueryAssist<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...this.state,
      visible: true,
    };
  }

  onHide = (): void => {
    this.setState({ visible: false });
  }

  onClose(): void {
    super.onClose();
    this.onHide();
  }

  onApplySavedQuery(savedQuery: SavedQuery) {
    super.onApplyQuery(savedQuery.query);
    this.onHide();
  }

  onSubmitEditing() {
    super.onSubmitEditing();
    this.onHide();
  }

  renderCloseButton() {
    return <IconClose size={21} color={styles.link.color}/>;
  }

  render(): Node {
    return (
      <ModalPortal
        onHide={this.onClose}
      >
        {this._renderInput()}
        {this._renderSuggestions()}
      </ModalPortal>
    );
  }
}


export default (QueryAssist: React$AbstractComponent<Props, mixed>);
