import { useState } from "react";
import { html } from 'htm/react';
import { css } from "emotion";

const toolbarWrapper = css`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 1rem;

  @media screen and (max-width: 768px) {
    margin-right: 0;
  }
`;
const toolbarControl = css`
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 14px;
  border: 0;
  font-size: 2rem;
  padding: 10px;

  &:hover {
    background: rgba(0, 0, 0, 0.75);
  }
`;
const osdToolbarDropdownWrapper = css`
  position: relative;
  display: inline-block;
`;
const osdToolbarDropdown = css`
  position: absolute;
  top: 50px;
  left: -65px;
  background: #342f2e;
  color: #e3e3e3;
  width: 200px;
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid #716c6b;

  button {
    padding: 0.75rem 1rem;
    color: #f0f0f0;
    display: inline-block;
    width: 100%;
    font-size: 1rem;
    &:hover {
      background: #716c6b;
      transition: all 0.25s ease-in-out;
    }
  }
`;

const Toolbar = ({ onDownloadCropClick, onDownloadFullSize }) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);

  function handleDownloadClick(e) {
    e.preventDefault();
    setDropDownOpen(!dropDownOpen);
  }

  function handleDownloadCropClick(e) {
    e.preventDefault();
    onDownloadCropClick();
    setDropDownOpen(false);
  }

  function handleDownloadFullSize(e) {
    e.preventDefault();
    onDownloadFullSize();
    setDropDownOpen(false);
  }

  return html`
    <nav className=${toolbarWrapper} className="osrv-toolbar-wrapper">
      <button
        id="zoom-in"
        href="#zoom-in"
        className=${toolbarControl}
        className="osrv-toolbar-button"
        title="Zoom In"
      >
        <i class="material-icons">zoom_in</i>
      </button>
      <button
        id="zoom-out"
        href="#zoom-out"
        className=${toolbarControl}
        className="osrv-toolbar-button"
        title="Zoom Out"
      >
        <i class="material-icons">zoom_out</i>
      </button>
      <button
        id="full-page"
        href="#full-page"
        className=${toolbarControl}
        className="osrv-toolbar-button"
        title="Full Screen"
      >
        <i class="material-icons">open_in_full</i>
      </button>
      <div className=${osdToolbarDropdownWrapper}>
        <button
          onClick=${handleDownloadClick}
          className=${toolbarControl}
          className="osrv-toolbar-button"
          aria-haspopup="true"
          aria-expanded=${dropDownOpen}
          title="Download"
        >
          <i class="material-icons">save_alt</i>
        </button>
        ${dropDownOpen && html`
          <ul className=${osdToolbarDropdown}>
            <li>
              <button
                title="Download cropped canvas"
                onClick=${handleDownloadCropClick}
                className=${toolbarControl}
                className="osrv-toolbar-button"
              >
                Download crop
              </button>
            </li>
            <li>
              <button
                onClick=${handleDownloadFullSize}
                className=${toolbarControl}
                className="osrv-toolbar-button"
                title="Download full size image"
              >
                Download full size
              </button>
            </li>
          </ul>
        `}
      </div>
    </nav>
  `;
};

export default Toolbar;
