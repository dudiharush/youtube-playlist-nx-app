import { TextField } from "@mui/material";
import React from "react";
import { SearchBarContainerStyled, ButtonStyled } from "./SearchBar.styled";
interface SearchBarProps {
  onInputChange: (value: string) => void;
  onAddClick: () => void;
}

export const SearchBar = ({ onInputChange, onAddClick }: SearchBarProps) => {
  return (
    <SearchBarContainerStyled>
      <TextField
        onChange={event => onInputChange(event.target.value)}
        id="outlined-secondary"
        placeholder="Enter video URL"
        type="search"
        margin="dense"
        variant="outlined"
        color="secondary"
      />
      <ButtonStyled
        variant="contained"
        onClick={onAddClick}
      >
        add
      </ButtonStyled>
    </SearchBarContainerStyled>
  );
};
