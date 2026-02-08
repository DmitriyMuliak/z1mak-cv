'use client';

import { useAppStore } from '@/store';

export const Temp = () => {
  const state = useAppStore();
  // React.useEffect(() => {
  //   state.topEntitySlice.userList.push({ name: 'DMYTRO' });
  // }, []);

  if (!state.topEntitySlice.userList.arr.length) return null;
  return (
    <div>
      <button
        onClick={() => {
          // state.topEntitySlice.innerEntitySlice.setValue(
          //   'innerValue',
          //   !state.topEntitySlice.innerEntitySlice.innerValue,
          // );
          // state.topEntitySlice.memValue('isBrandCool', false);
          // state.topEntitySlice.setPatch({
          //   innerEntitySlice: {
          //     innerValue: !state.topEntitySlice.innerEntitySlice.innerValue,
          //     setValue: state.topEntitySlice.innerEntitySlice.setValue,
          //   },
          // });
          // state.topEntitySlice.setter((set) =>
          //   set((state) => {
          //     state.innerEntitySlice.innerValue = !state.innerEntitySlice.innerValue;
          //   }),
          // );
        }}
        className="button btn"
      >
        SET NEW VALUE
      </button>
      <div> VALUE: {`${state.topEntitySlice.innerEntitySlice.innerValue}`}</div>
      <div>EEEEEE: {state.topEntitySlice.userList.arr[0].name}</div>;
    </div>
  );
};
