import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { toggleModal } from 'components/Modal/modalSlice';
import TextBox from 'components/TextBox/TextBox';
// import Button from 'components/Button/Button';

export interface IModal {
  title?: string;
  content?: JSX.Element;
}

export const Modal: React.FC<IModal> = ({ title, content }) => {
  // Get visibility from Redux
  const { visible } = useSelector((state: RootState) => state.modalVisibility);
  const dispatch = useDispatch();

  useEffect(() => {
    visible
      ? document.body.classList.add('overflow-hidden')
      : document.body.classList.remove('overflow-hidden');
  }, [visible]);

  return visible ? (
    <div className="modal z-40 fixed w-full h-full top-0 left-0 flex items-center justify-center">
      <div
        onClick={() => dispatch(toggleModal({ visible: false }))}
        className="modal-overlay absolute w-full h-full bg-dark-100 opacity-75"
      ></div>

      <div className="modal-container h-5/6 bg-light-300 dark:bg-dark-200 w-11/12 max-w-4xl rounded shadow-lg z-50 overflow-y-auto">
        <div className="h-full modal-content py-4 text-left px-6">
          <div className="flex justify-between items-center overflow-y-scroll">
            <p className="text-2xl font-bold">{title}</p>
            <div
              onClick={() => dispatch(toggleModal({ visible: false }))}
              className="modal-close cursor-pointer z-50"
            >
              <svg
                className="fill-current dark:text-white opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
              </svg>
            </div>
          </div>
          <TextBox extraClassName="bg-light-400">{content}</TextBox>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
