import { html } from 'htm/react';
import { makeStyles } from '@material-ui/core/styles';
import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { NavigateBefore, NavigateNext } from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import { Statuses } from './graphql/queries';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';
import config from './config';

const useStyles = makeStyles((theme) => ({
  text: {
    padding: theme.spacing(2, 2, 0),
  },
  appBar: {
    backgroundColor: theme.palette.grey[600],
  },
  grow: {
    flex: 1,
  },
  statusButtonGroup: {
    width: '15%',
    minWidth: 200,
    flexWrap: 'wrap',
    backgroundColor: theme.palette.background.default,
  },
  navBeforeButton: {
    marginRight: theme.spacing(4),
  },
  navNextButton: {
    marginLeft: theme.spacing(4),
  },
}));

export default function AppBar({currentSlide, role, updateStatus, backUpSlide}) {
  const classes = useStyles();
  
  const handleStatusChange = (event, newStatus) => {
    updateStatus({ variables: { imageid: currentSlide.ImageID, status: newStatus } });
    if (newStatus == config.doneStatus) {
      backUpSlide({
        ImageID: currentSlide.ImageID,
        Filename: currentSlide.Filename
      });
    }
  };

  return html`
    <${MuiAppBar} position="static" className=${classes.appBar}>
      <${Toolbar}>
        <${Tooltip} title="Previous slide">
          <${IconButton} id="prevSlide" edge="start" color="inherit" className=${classes.navBeforeButton} >
            <${NavigateBefore} fontSize="large" />
          </${IconButton}>
        </${Tooltip}>
        <${Typography} variant="h5" className=${classes.grow}>
          ${currentSlide.SlideID}
        </${Typography}>
        <${ToggleButtonGroup}
          size="large"
          value=${currentSlide.Status}
          exclusive
          onChange=${handleStatusChange}
          disabled=${role == 'QC'}
          className=${classes.statusButtonGroup}
        >
          ${Statuses.map(status => html`
            <${ToggleButton}
              key=${status}
              value=${status}
              children=${status}
              className=${classes.grow}
            />
          `)}
        </${ToggleButtonGroup}>
        <div className=${classes.grow} />
        <${Tooltip} title="Next slide">
          <${IconButton} id='nextSlide' edge="end" color="inherit" className=${classes.navNextButton} >
            <${NavigateNext} fontSize="large" />
          </${IconButton}>
        </${Tooltip}>
      </${Toolbar}>
    </${MuiAppBar}>
  `;
}
