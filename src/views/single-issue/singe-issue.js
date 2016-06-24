import {Text, View, Image, TouchableOpacity, ScrollView, TextInput, Clipboard, Platform, ActivityIndicator} from 'react-native';
import React, {PropTypes} from 'react';

import ApiHelper from '../../components/api/api__helper';
import {comment} from '../../components/icon/icon';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import SingleIssueComments from './single-issue__comments';
import Router from '../../components/router/router';
import Header from '../../components/header/header';
import ColorField from '../../components/color-field/color-field';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import {showActions} from '../../components/action-sheet/action-sheet';
import Wiki, {decorateRawText} from '../../components/wiki/wiki';
import IssuePermissions from '../../components/issue-permissions/issue-permissions';
import {notifyError} from '../../components/notification/notification';
import SingleIssueCommentInput from './single-issue__comment-input';
import styles from './single-issue.styles';
import {FOOTER_HEIGHT} from '../../components/variables/variables';

export default class SingeIssueView extends React.Component {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.issuePermissions = new IssuePermissions(this.props.api.auth.permissions, this.props.api.auth.currentUser);

    this.state = {
      issue: null,
      fullyLoaded: false,

      editMode: false,
      isSavingEditedIssue: false,
      addCommentMode: false,
      summaryCopy: null,
      descriptionCopy: null
    };
  }

  componentDidMount() {
    this.setState({issue: this.props.issuePlaceholder});
    this.loadIssue(this.props.issueId);
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  loadIssue(id) {
    //HACK about issue load by readable ID
    if (/[A-Z]/.test(id)) {
      return this.props.api.hackishGetIssueByIssueReadableId(id)
        .then((issue) => {
          issue.fieldHash = ApiHelper.makeFieldHash(issue);
          return issue;
        })
        .then((issue) => {
          console.log('Issue (by readable id)', issue);
          if (this.isUnmounted) {
            return;
          }
          this.setState({issue, fullyLoaded: true});
          return issue;
        })
    }

    return this.props.api.getIssue(id)
      .then((issue) => {
        issue.fieldHash = ApiHelper.makeFieldHash(issue);
        return issue;
      })
      .then((issue) => {
        console.log('Issue', issue);
        if (this.isUnmounted) {
          return;
        }
        this.setState({issue, fullyLoaded: true});
        return issue;
      })
      .catch((result) => {
        if (result.json) {
          return result.json()
            .then(res => global.alert(res.error_description || res));
        }
        console.warn('failed to load issue', result, result.message);
      });
  }

  addComment(issue, comment) {

    return this.props.api.addComment(issue.id, comment)
      .then((res) => {
        console.info('Comment created', res);
        this.setState({addCommentMode: false});
        this.loadIssue(this.props.issueId)
      })
      .catch(err => notifyError('Cannot post comment', err));
  }

  getAuthorForText(issue) {

    let forText = () => {
      if (issue.fieldHash.Assignee) {
        return `for ${issue.fieldHash.Assignee.fullName || issue.fieldHash.Assignee.login}`;
      }
      return '    Unassigned'
    };
    return `${issue.reporter.fullName || issue.reporter.login} ${forText()}`
  }

  onIssueFieldValueUpdate(field, value) {
    field.value = value;
    this.forceUpdate();
    const updateMethod = field.hasStateMachine ?
      this.props.api.updateIssueFieldEvent.bind(this.props.api) :
      this.props.api.updateIssueFieldValue.bind(this.props.api);

    return updateMethod(this.props.issueId, field.id, value)
      .then(() => this.loadIssue(this.props.issueId))
      .then((res) => this.props.onUpdate && this.props.onUpdate(res))
      .catch((err) => {
        notifyError('failed to update issue field', err);
        return this.loadIssue(this.props.issueId);
      });
  }

  onUpdateProject(project) {
    this.state.issue.project = project;
    this.forceUpdate();

    return this.props.api.updateProject(this.state.issue, project)
      .catch((err) => notifyError('Failed to update issue project', err))
      .then(() => this.loadIssue(this.props.issueId))
  }

  onSaveChanges() {
    this.state.issue.summary = this.state.summaryCopy;
    this.state.issue.description = this.state.descriptionCopy;
    this.setState({isSavingEditedIssue: true});

    return this.props.api.updateIssueSummaryDescription(this.state.issue)
      .then(() => this.setState({editMode: false, isSavingEditedIssue: false}))
      .catch((err) => {
        this.setState({isSavingEditedIssue: false});
        notifyError('Failed to update issue project', err);
      });
  }

  goToIssue(issue) {
    issue.fieldHash = ApiHelper.makeFieldHash(issue);

    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id,
      api: this.props.api
    });
  }

  goToIssueById(issueId) {
    Router.SingleIssue({
      issueId: issueId,
      api: this.props.api
    });
  }

  openIssueListWithSearch(query) {
    Router.IssueList({auth: this.props.api.auth, query: query});
  }

  _showActions() {
    const actions = [
      {
        title: 'Edit issue',
        execute: () => {
          this.setState({
            editMode: true,
            summaryCopy: this.state.issue.summary,
            descriptionCopy: this.state.issue.description
          });
        }
      }, {
        title: 'Copy issue web link',
        execute: () => {
          const {numberInProject, project} = this.state.issue;
          Clipboard.setString(`${this.props.api.config.backendUrl}/issue/${project.shortName}-${numberInProject}`)
        }
      },
      {title: 'Cancel'}
    ];

    return showActions(actions, this.context.actionSheet())
      .then(action => action.execute())
      .catch(err => {});
  }

  _canAddComment() {
    return this.state.fullyLoaded &&
      !this.state.addCommentMode &&
      this.issuePermissions.canCommentOn(this.state.issue);
  }

  _renderHeader() {
    const title = <Text>{this.state.issue && (`${this.state.issue.project.shortName}-${this.state.issue.numberInProject}`)}</Text>;

    if (!this.state.editMode) {
      const rightButton = this.state.issue && this.issuePermissions.canUpdateGeneralInfo(this.state.issue) ? <Text>Actions</Text> : null;

      return <Header leftButton={<Text>Back</Text>}
                     rightButton={rightButton}
                     onRightButtonClick={() => this._showActions()}>
        {title}
      </Header>

    } else {
      const canSave = Boolean(this.state.summaryCopy);
      const saveButton = <Text style={canSave ? null : styles.disabledSaveButton}>Save</Text>;

      return <Header leftButton={<Text>Cancel</Text>}
                     onBack={() => this.setState({editMode: false})}
                     rightButton={this.state.isSavingEditedIssue ? <ActivityIndicator style={styles.savingIndicator}/> : saveButton}
                     onRightButtonClick={() => canSave && this.onSaveChanges()}>
        {title}
      </Header>

    }
  }

  _renderAttachments(attachments) {
    if (!attachments) {
      return;
    }

    return <ScrollView style={styles.attachesContainer} horizontal={true}>
      {(attachments || [])
        .filter(attach => attach.mimeType.includes('image'))
        .map((attach) => {
        return <TouchableOpacity onPress={() => Router.ShowImage({imageUrl: attach.url, imageName: attach.value})} key={attach.id}>
          <Image style={styles.attachment}
                 capInsets={{left: 15, right: 15, bottom: 15, top: 15}}
                 source={{uri: attach.url}}/>
        </TouchableOpacity>
      })}
    </ScrollView>;
  }

  _renderTags(tags) {
    if (!tags || !tags.length) {
      return;
    }

    return <View style={styles.tagsContainer}>
      {tags.map(tag => {
        return <TouchableOpacity onPress={() => this.openIssueListWithSearch(tag.query)} key={tag.id} style={styles.tagButton}>
          <ColorField text={tag.name} color={tag.color} fullText={true} style={styles.tagColorField}/>
        </TouchableOpacity>
      })}
    </View>
  }

  _renderIssueView(issue) {
    return (
      <View style={styles.issueViewContainer}>
        {this._renderTags(issue.tags)}

        <Text style={styles.authorForText}>{this.getAuthorForText(issue)}</Text>

        {this.state.editMode && <View>
          <TextInput
            style={styles.summaryInput}
            placeholder="Summary"
            editable={!this.state.isSavingEditedIssue}
            autoFocus={true}
            value={this.state.summaryCopy}
            onSubmitEditing={() => this.refs.description.focus()}
            onChangeText={text => this.setState({summaryCopy: text})}/>
          <View style={styles.separator}/>
          <TextInput
            ref="description"
            style={styles.descriptionInput}
            editable={!this.state.isSavingEditedIssue}
            value={this.state.descriptionCopy}
            multiline={true}
            placeholder="Description"
            onChangeText={text => this.setState({descriptionCopy: text})}/>
        </View>}

        {!this.state.editMode && <View>
          <Text style={styles.summary}>{issue.summary}</Text>

          {issue.links && <LinkedIssues links={issue.links} onIssueTap={issue => this.goToIssue(issue)}/>}

          {issue.description && <Wiki style={styles.description} onIssueIdTap={issueId => this.goToIssueById(issueId)}>
            {decorateRawText(issue.description, issue.wikifiedDescription, issue.attachments)}
          </Wiki>}
        </View>}

        {this._renderAttachments(issue.attachments)}
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container} ref="container">
        {this._renderHeader()}

        {this.state.issue && <ScrollView>
          {this._renderIssueView(this.state.issue)}

          {!this.state.fullyLoaded && <View><Text style={styles.loading}>Loading...</Text></View>}

          {this.state.fullyLoaded && <View style={styles.commentsListContainer}>
            <SingleIssueComments
              comments={this.state.issue.comments}
              attachments={this.state.issue.attachments}
              api={this.props.api}
              onIssueIdTap={issueId => this.goToIssueById(issueId)}/>
          </View>}
        </ScrollView>}

        {this.state.addCommentMode && <View>
          <SingleIssueCommentInput
          autoFocus={true}
          onBlur={() => this.setState({addCommentMode: false})}
          onAddComment={(comment) => this.addComment(this.state.issue, comment)}/>

          {Platform.OS == 'ios' && <KeyboardSpacer topSpacing={-FOOTER_HEIGHT}/>}
        </View>}

        {this._canAddComment() && <View style={styles.addCommentContainer}>
          <TouchableOpacity style={styles.addCommentButton}
                                                    onPress={() => this.setState({addCommentMode: true})}>
            <Image source={comment} style={styles.addCommentIcon}/>
          </TouchableOpacity>
        </View>}


        {this.state.issue && <CustomFieldsPanel
          containerViewGetter={() => this.refs.container}
          api={this.props.api}
          canEditProject={this.issuePermissions.canUpdateGeneralInfo(this.state.issue)}
          issue={this.state.issue}
          issuePermissions={this.issuePermissions}
          onUpdate={this.onIssueFieldValueUpdate.bind(this)}
          onUpdateProject={this.onUpdateProject.bind(this)}/>}
      </View>
    );
  }
}
