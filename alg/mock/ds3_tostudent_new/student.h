#ifndef __STUDENT_H_
#define __STUDENT_H_
#include "map_bst.h"

//this is the modify() function to be submitted
template <typename KeyT,
          typename MappedT,
          typename CompareT >
void CP::map_bst<KeyT,MappedT,CompareT>::modify(
	CP::map_bst<KeyT,MappedT,CompareT> &other
) {
	
	if(other.mRoot == NULL || mRoot == NULL) return;

	graft(mRoot,other.mRoot,other.mSize);
	other.mRoot = NULL;
	other.mSize =0;
	return;
}

//you may use this function to traverse and graft
template <typename KeyT,
          typename MappedT,
          typename CompareT >
void CP::map_bst<KeyT,MappedT,CompareT>::graft(
	CP::map_bst<KeyT,MappedT,CompareT>::node* n, CP::map_bst<KeyT,MappedT,CompareT>::node* m, size_t otherSize
) {
	
	if(n == NULL) return;
	if(n->data.first == m->data.first){
		if(n->left == NULL && n->right == NULL){
			if(m->left != NULL){
				n->left = m->left;
				m->left->parent = n;
			}

			if(m->right != NULL){
				n->right = m->right;
				m->right->parent = n;
			}

			mSize += otherSize-1;
			otherSize = 0;
		}
		return;

	}else{
		if(mLess(m->data.first,n->data.first)){
			if(n->left == NULL){
				n->left = m;
				m->parent = n;

				mSize += otherSize;
				otherSize = 0;
			}else{
				graft(n->left,m,otherSize);
			}
		}else {
			if(n->right == NULL){
				n->right = m;
				m->parent = n;

				mSize += otherSize;
				otherSize = 0;
			}else {
				graft(n->right,m,otherSize);
			}
		}

	}
}

#endif
