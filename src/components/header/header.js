/* @flow */

import type {Node} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';

import Router from '../router/router';

import {ThemeContext} from '../theme/theme-context';

import {HIT_SLOP} from '../common-styles/button';
import styles from './header.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {Theme} from 'flow/Theme';

export type HeaderProps = {
  onBack?: () => any,
  onRightButtonClick?: Function,
  leftButton?: ?React$Element<any> | null,
  rightButton?: ?React$Element<any> | null,
  extraButton?: ?React$Element<any> | null,
  children?: any,
  style?: ViewStyleProp,
  title?: string,
  showShadow?: boolean,
}

type DefaultProps = {
  onRightButtonClick: Function,
  showShadow: boolean,
}

export default class Header extends PureComponent<HeaderProps, void> {
  static defaultProps: DefaultProps = {
    onRightButtonClick: () => undefined,
    showShadow: false,
  };

  onBack(): any {
    if (this.props.onBack) {
      return this.props.onBack();
    }
    return Router.pop();
  }

  onRightButtonClick: (() => any | void) = () => {
    if (this.props.onRightButtonClick) {
      return this.props.onRightButtonClick();
    }
  }

  render(): Node {
    const {leftButton, children, extraButton, rightButton, style, title, showShadow} = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <View
              testID="header"
              style={[
                styles.header,
                showShadow ? styles.headerShadow : null,
                style,
              ]}
            >
              {!!leftButton && <TouchableOpacity
                testID="test:id/header-back"
                accessibilityLabel="header-back"
                accessible={true}
                hitSlop={HIT_SLOP}
                style={styles.headerButtonLeft}
                onPress={() => this.onBack()}
              >
                {leftButton}
              </TouchableOpacity>}

              {!!title && (
                <Text
                  testID="test:id/headerTitle"
                  accessibilityLabel="headerTitle"
                  accessible={true}
                  style={styles.headerTitle}>{title}</Text>
              )}

              <View style={styles.headerCenter} testID="header-content">
                {children}
              </View>

              {!!extraButton && <TouchableOpacity
                testID="test:id/extra-button"
                accessibilityLabel="extra-button"
                accessible={true}>
                {extraButton}
              </TouchableOpacity>
              }

              {!!rightButton && <TouchableOpacity
                testID="test:id/header-action"
                accessibilityLabel="header-action"
                accessible={true}
                hitSlop={HIT_SLOP}
                style={styles.headerButtonRight}
                onPress={this.onRightButtonClick}>
                {rightButton}
              </TouchableOpacity>}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}
