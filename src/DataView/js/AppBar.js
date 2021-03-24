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
import config from './config';

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

  return html`
    <div>
      <${MuiAppBar} position="fixed">
        <${Toolbar}>
          <${Typography} variant="h6" className=${classes.title}>
            ${title || 'Virtual Slide Viewer'}
          </${Typography}>
            <${Fab}
              href=${`viewer/index.html?imageIds=${selectedImages}`}
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
              ${statusFilter == config.doneStatus && html`
                <${MenuItem}
                  onClick=${() => {
                    removeImages('TRANSFERRED', selectedImages);
                    setAnchorEl(null);
                  }}
                  disabled=${selectedImages.length == 0}
                >
                  <${ListItemIcon}>
                    <${Archive} fontSize="small" />
                  </${ListItemIcon}>
                  <${ListItemText} primary="Transfer/archive slides" />
                </${MenuItem}>
              `}
              ${statusFilter != config.doneStatus && html`
                <${MenuItem}
                  onClick=${() => {
                    removeImages('DELETED', selectedImages);
                    setAnchorEl(null);
                  }}
                  disabled=${selectedImages.length == 0}
                >
                  <${ListItemIcon}>
                    <${Delete} fontSize="small" />
                  </${ListItemIcon}>
                  <${ListItemText} primary="Delete slides" />
                </${MenuItem}>
              `}
              </${Menu}>
        </${Toolbar}|>
      </${MuiAppBar}>
      <div className=${classes.offset} />
    </div>
  `;
}