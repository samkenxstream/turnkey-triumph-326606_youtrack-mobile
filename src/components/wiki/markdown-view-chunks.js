/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';

import {stringToTokens, tokensToAST} from 'react-native-markdown-display';

import apiHelper from 'components/api/api__helper';
import getMarkdownRules from './markdown-view-rules';
import MarkdownAST from 'components/wiki/markdown-ast';
import MarkdownItInstance from './markdown-instance';
import {getApi} from '../api/api__instance';
import {getStorageState} from '../storage/storage';
import {hasType} from '../api/api__resource-types';
import {SkeletonIssueContent} from '../skeleton/skeleton';
import {updateMarkdownCheckbox} from './markdown-helper';

import type {Article} from 'flow/Article';
import type {ASTNode} from 'react-native-markdown-display';
import type {Attachment} from 'flow/CustomFields';
import type {Folder} from 'flow/User';
import type {IssueOnList} from 'flow/Issue';
import type {MarkdownNode} from 'flow/Markdown';
import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {UITheme} from 'flow/Theme';

type Props = {
  attachments?: Array<Attachment>,
  children: string,
  chunkSize?: number,
  mentionedArticles?: Array<Article>,
  mentionedIssues?: Array<IssueOnList>,
  uiTheme: UITheme,
  scrollData?: Object,
  onCheckboxUpdate?: (markdown: string) => Function,
  textStyle?: TextStyleProp,
};

const DEFAULT_CHUNK_SIZE: number = 10;
let chunks: Array<Array<MarkdownNode>> = [];
let rules: Object = {};
let tokens: Array<MarkdownNode> = [];
let md: string | null = null;

const MarkdownViewChunks = (props: Props) => {
  const {
    children,
    scrollData = {},
    mentionedArticles = [],
    mentionedIssues = [],
    onCheckboxUpdate = (checked: boolean, position: number, markdown: string) => {},
  } = props;

  const [chunksToRender, updateChunksToRender] = useState(1);
  const [astToRender, updateAstToRender] = useState([]);

  const createMarkdown = useCallback((markdown: string): void => {
    tokens = stringToTokens(markdown, MarkdownItInstance);
    chunks = createChunks(tokensToAST(tokens), props.chunkSize);
    updateAstToRender(chunks);
  }, [props.chunkSize]);

  const onCheckboxPress = (checked: boolean, position: number): void => {
    if (md) {
      onCheckboxUpdate(checked, position, updateMarkdownCheckbox(md, position, checked));
    }
  };

  const createRules = (): Object => {
    const projects: Array<Folder> = (getStorageState().projects || []).map((it: Folder) => hasType.project(it) && it);
    const attaches: Array<Attachment> = apiHelper.convertAttachmentRelativeToAbsURLs(
      props.attachments || [],
      getApi().config.backendUrl
    );
    return getMarkdownRules(
      attaches,
      projects,
      props.uiTheme, {
        articles: mentionedArticles,
        issues: mentionedIssues,
      },
      onCheckboxPress,
      props.textStyle,
    );
  };

  useEffect(() => {
    rules = createRules();
    return () => {
      tokens = [];
      rules = {};
      md = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    createMarkdown(children);
    md = children;
  }, [children, createMarkdown]);

  const renderAST = (ast: Array<ASTNode>, key: string): React$Element<typeof MarkdownAST> => {
    return (
      <MarkdownAST
        textStyle={props.textStyle}
        testID="chunk"
        key={key}
        ast={ast}
        rules={rules}
      />
    );
  };

  if (!children || astToRender?.length === 0) {
    return null;
  }

  const hasMore: boolean = (chunksToRender + 1) <= chunks.length;
  scrollData.loadMore = () => {
    const number = chunksToRender + 1;
    if (number <= chunks.length) {
      updateChunksToRender(number);
    }
  };

  return (
    <View
      testID="markdownViewChunks"
    >
      {
        astToRender.slice(0, chunksToRender).map(
          (astPart, index) => renderAST(astPart, `chunk-${index}`)
        )
      }

      {hasMore && <SkeletonIssueContent/>}
    </View>
  );

};

export default (React.memo<Props>(MarkdownViewChunks): React$AbstractComponent<Props, mixed>);


function createChunks(array: Array<ASTNode>, size: number = DEFAULT_CHUNK_SIZE): Array<ASTNode> {
  const chunked_arr: Array<ASTNode> = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
}
