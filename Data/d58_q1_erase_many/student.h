#ifndef __STUDENT_H_
#define __STUDENT_H_

template <typename T>
void CP::vector<T>::erase_many(const std::vector<int> &pos) {
    if (pos.empty()) return;

    std::vector<bool> toerase(mSize, false);
    for (int i = 0; i < (int)pos.size(); i++) {
        if (pos[i] >= 0 && (size_t)pos[i] < mSize) {
            toerase[pos[i]] = true;
        }
    }

    size_t newSize = 0;
    for (size_t i = 0; i < mSize; i++) {
        if (!toerase[i]) {
            mData[newSize] = mData[i];newSize++;
        }
    }
    mSize = newSize;
}

#endif
