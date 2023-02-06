import styled from "styled-components";

export const Container = styled.button`
    display: flex;
    align-items: center;
    text-align: end;
    
    width: 20%;
    height: 4.8rem;

    font-size: 1.6rem;
    font-family: 'Poppins', sans-serif;
    
    border: none;
    gap: 0.8rem;

    background: none;
    color: ${({ theme }) => theme.COLORS.WHITE};
`;