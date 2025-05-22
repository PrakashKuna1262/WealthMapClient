import styled from 'styled-components';

export const SigninContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3498db 100%);
  color: white;
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

export const Form = styled.form`
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
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
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  box-sizing: border-box;

  &:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.25);
    border-color: #ffa500;
    box-shadow: 0 0 15px rgba(255, 165, 0, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
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

  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(255, 165, 0, 0.5); }
    50% { box-shadow: 0 0 20px rgba(255, 165, 0, 0.8); }
    100% { box-shadow: 0 0 5px rgba(255, 165, 0, 0.5); }
  }
`;

export const LoginLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  width: 100%;
`;