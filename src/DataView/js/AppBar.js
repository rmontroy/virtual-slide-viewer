import { useState } from 'react';
import { html } from 'htm/react';
import { makeStyles } from '@material-ui/core/styles';
import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { Visibility, Refresh,  MoreVert, Delete, Archive } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import config from './config';
import { Auth } from 'aws-amplify';

const useStyles = makeStyles((theme) => ({
  viewButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  offset: theme.mixins.toolbar,
}));

export default function AppBar({title, selectedImages, refetch, removeImages, statusFilter}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const isDone = statusFilter == config.doneStatus;

  return html`
    <${MuiAppBar} position="fixed">
      <${Toolbar}>
        <${Typography} variant="h6" className=${classes.title}>
          ${title || 'Virtual Slide Viewer'}
        </${Typography}>
          <${Fab}
            href=${`viewer/index.html?imageIds=${selectedImages.map(image => image.ImageID)}`}
            variant="extended"
            color="secondary"
            size="medium"
            disabled=${selectedImages.length == 0}
            className=${classes.viewButton}
          >
            <${Visibility} style=${{marginRight: 8}} />
            View
          </${Fab}>
          <${Tooltip} title="Refetch">
            <${IconButton}
                color="inherit"
                onClick=${() => refetch()}
                aria-label="menu"
            >
              <${Refresh} />
            </${IconButton}>
          </${Tooltip}>
          <${Tooltip} title="More">
            <${IconButton}
                edge="end"
                color="inherit"
                onClick=${handleMenu}
                aria-label="menu"
            >
              <${MoreVert} />
            </${IconButton}>
          </${Tooltip}>
          <${Menu}
            open=${Boolean(anchorEl)}
            id="menu-appbar"
            anchorEl=${anchorEl}
            anchorOrigin=${{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin=${{
              vertical: 'top',
              horizontal: 'right',
            }}
            onClose=${() => {
              setAnchorEl(null);
            }}
          >
            <${MenuItem}
              onClick=${() => {
                removeImages(isDone ? 'TRANSFERRED' : 'DELETED', selectedImages);
                setAnchorEl(null);
              }}
              disabled=${selectedImages.length == 0}
            >
              <${ListItemIcon}>
                <${isDone ? Archive : Delete} fontSize="small" />
              </${ListItemIcon}>
              <${ListItemText} primary=${isDone ? 'Transfer/archive images' : 'Delete images'} />
            </${MenuItem}>
            <${Divider} variant="middle" />
            <${MenuItem}
              onClick=${() => {
                Auth.signOut();
                setAnchorEl(null);
              }}
            >
              <${ListItemIcon}>
                <span class="material-icons">logout</span>
              </${ListItemIcon}>
              <${ListItemText} primary="Sign out" />
            </${MenuItem}>
          </${Menu}>
      </${Toolbar}|>
    </${MuiAppBar}>
  `;
}