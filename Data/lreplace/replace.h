void replace(const T& x, list<T>& y) {
  auto it = begin();
  auto endit = end();
  while(it != endit){
    if(*it == x){
      it = erase(it);
      for(auto a:y){
        insert(it,a);
      }

    }else {
      it++;
    }
  }

}
