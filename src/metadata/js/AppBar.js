import { html } from 'htm/react';
import { makeStyles } from '@material-ui/core/styles';
import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Zoom from '@material-ui/core/Zoom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  sectionActions: {
    '& > *': {
      marginRight: theme.spacing(2),
    },
  },
  offset: theme.mixins.toolbar,
}));

export default function AppBar({title, selectedImages, refetch}) {
  const classes = useStyles();
  return html`
    <div className=${classes.root}>
      <${MuiAppBar} position="fixed">
        <${Toolbar}>
          <${Typography} variant="h6" className=${classes.title}>
            ${title || 'Virtual Slide'}
          </${Typography}>
          <div className=${classes.sectionActions}>
            <${Zoom} in=${selectedImages.length > 0}>
              <${Fab} href=${"viewer?imageIds=" + selectedImages} variant="extended" color="secondary"  size="medium">
                <${VisibilityIcon} style=${{marginRight: 8}} />
                View
              </${Fab}>
            </${Zoom}>
            <${Tooltip} title="Refetch">
              <${IconButton}
                  edge="start"
                  className=${classes.menuButton}
                  color="inherit"
                  onClick=${() => refetch()}
                  aria-label="menu"
              >
                <${RefreshIcon} />
              </${IconButton}>
            </${Tooltip}>
          </div>
        </${Toolbar}|>
      </${MuiAppBar}>
      <div className=${classes.offset} />
    </div>
  `;
}