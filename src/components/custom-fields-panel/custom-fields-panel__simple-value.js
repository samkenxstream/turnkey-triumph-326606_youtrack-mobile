/* @flow */


import React, {useEffect, useState} from 'react';
import {TextInput, View} from 'react-native';

import Header from '../header/header';
import {IconBack, IconCheck, IconClose} from '../icon/icon';

import styles from './custom-fields-panel.styles';

import type {CustomField as IssueCustomField} from 'flow/CustomFields';

type Props = {
  modal?: boolean,
  editingField: ?IssueCustomField,
  onApply: any => any,
  placeholder: string,
  title: string,
  onHide: () => void,
  value: string,
}


const SimpleValueEditor = (props: Props) => {
  const [value, updateValue] = useState('');

  useEffect(() => {
    updateValue(props.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header
        style={styles.customFieldEditorHeader}
        leftButton={props.modal ? <IconBack color={styles.link.color}/> : <IconClose size={21} color={styles.link.color}/>}
        onBack={props.onHide}
        rightButton={value.trim() ? <IconCheck size={21} color={styles.link.color}/> : null}
        onRightButtonClick={() => {
          props.onApply(value);
        }}
        title={props.title}
      />
      <View style={styles.customFieldSimpleEditor}>
        <TextInput
          multiline
          style={styles.simpleValueInput}
          placeholder={props.placeholder}
          placeholderTextColor={styles.placeholderText.color}
          underlineColorAndroid="transparent"
          clearButtonMode="always"
          returnKeyType="done"
          autoCorrect={false}
          autoFocus={true}
          autoCapitalize="none"
          onChangeText={(value: any) => {
            updateValue(value);
          }}
          value={value}/>
      </View>
    </>
  );
};

export default (React.memo<Props>(SimpleValueEditor): React$AbstractComponent<Props, mixed>);
