import styled from 'styled-components';

export const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.05) 1%, transparent 1%),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 1%, transparent 1%);
    background-size: 50px 50px;
    opacity: 0.5;
    pointer-events: none;
  }
`;

export const Title = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const IconLarge = styled.span`
  font-size: 2rem;
  color: #ffa500;
`;

export const LoginForm = styled.form`
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.8s ease-in-out, float 6s ease-in-out infinite;
  display: flex;
  flex-direction: column;
  align-items: center;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

export const RoleSelector = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  padding: 0.5rem;
`;

export const RoleOption = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: ${props => props.active ? 'rgba(255, 165, 0, 0.8)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? 'bold' : 'normal'};

  &:hover {
    background: ${props => props.active ? 'rgba(255, 165, 0, 0.8)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

export const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
`;

export const InputIcon = styled.span`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #ffa500;
  transition: all 0.3s ease;
  z-index: 1;
  filter: drop-shadow(0 0 2px rgba(255, 165, 0, 0.5));
`;

export const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  box-sizing: border-box;

  &:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.15);
    border-color: #ffa500;
    box-shadow: 0 0 15px rgba(255, 165, 0, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 30px;
  background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 165, 0, 0.4);
  animation: glow 3s infinite;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 165, 0, 0.5);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(255, 165, 0, 0.5); }
    50% { box-shadow: 0 0 20px rgba(255, 165, 0, 0.8); }
    100% { box-shadow: 0 0 5px
}