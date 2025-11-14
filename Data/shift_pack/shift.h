
void shift(int k) {
	int idx;
	if(k>=0){
		idx = k%mSize;

	}else {
		idx = (mSize-(k*(-1))%mSize)%mSize;
	}
	auto tmp = mHeader->next;
	for(size_t i=0;i<idx;i++){
		tmp = tmp->next;

	}
	mHeader->next->prev = mHeader->prev;
	mHeader->prev->next = mHeader->next;

	tmp->prev->next = mHeader;
	mHeader->prev = tmp->prev;
	tmp->prev = mHeader;
	mHeader->next = tmp;


}



