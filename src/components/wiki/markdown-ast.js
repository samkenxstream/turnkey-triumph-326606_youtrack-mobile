/* @flow */

import React, {useContext} from 'react';

import Markdown from 'react-native-markdown-display';

import MarkdownItInstance from './markdown-instance';
import markdownStyles from './markdown-view-styles';
import {ThemeContext} from '../theme/theme-context';

import type {MarkdownNode} from 'flow/Markdown';
import type {Theme} from 'flow/Theme';
import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  ast: Array<MarkdownNode>,
  rules: Object,
  textStyle?: TextStyleProp,
};

const MarkdownAST = (props: Props) => {
  const {ast, rules, textStyle} = props;
  const theme: Theme = useContext(ThemeContext);

  return (
    <Markdown
      style={markdownStyles(theme?.uiTheme, textStyle)}
      markdownit={MarkdownItInstance}
      rules={rules}
    >
      {ast}
    </Markdown>
  );
};

export default (React.memo<Props>(
  MarkdownAST,
  (prevProps: Props, nextProps: Props) => prevProps.ast === nextProps.ast
): React$AbstractComponent<Props, mixed>);
